import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { mapAuthError } from '@/lib/utils'

// ─── Tipler ────────────────────────────────────────────────────────────────

export type SignInStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'invalid_credentials'
  | 'not_admin'
  | 'inactive_admin'
  | 'error'

interface AdminProfile {
  role: string
  is_active: boolean
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
  /** Giriş denemesinin sonucu — form bileşeni bunu okuyarak toast/hata gösterir */
  signInStatus: SignInStatus
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  clearSignInStatus: () => void
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Yardımcı Fonksiyon ─────────────────────────────────────────────────────

/**
 * Verilen kullanıcı UID'si için admin_profiles tablosunu sorgular.
 * Kullanıcının hem `role = 'admin'` hem de `is_active = true` olması gerekir.
 *
 * @returns
 *   - `'admin'`          → yetkili ve aktif admin
 *   - `'inactive'`       → kayıt var ama is_active = false
 *   - `'not_found'`      → kayıt yok
 *   - `'error'`          → sorgu hatası
 */
async function fetchAdminProfile(
  userId: string
): Promise<'admin' | 'inactive' | 'not_found' | 'error'> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[Auth] admin_profiles sorgusu başarısız:', error.message)
    return 'error'
  }

  if (!data) return 'not_found'

  const profile = data as AdminProfile

  if (profile.role === 'admin' && profile.is_active) return 'admin'
  if (profile.role === 'admin' && !profile.is_active) return 'inactive'

  return 'not_found'
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signInStatus, setSignInStatus] = useState<SignInStatus>('idle')

  const clearSignInStatus = useCallback(() => setSignInStatus('idle'), [])

  // ─── Oturum başlatma ve izleme ──────────────────────────────────────────
  useEffect(() => {
    // 1. Mevcut oturumu kontrol et
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        const result = await fetchAdminProfile(s.user.id)
        setIsAdmin(result === 'admin')

        // Oturum açık ama admin yetkisi yoksa oturumu kapat
        if (result !== 'admin') {
          console.warn('[Auth] Oturum var ama admin yetkisi yok — oturum kapatılıyor.')
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
        }
      }

      setLoading(false)
    })

    // 2. Auth state değişikliklerini izle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        const result = await fetchAdminProfile(s.user.id)
        setIsAdmin(result === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Giriş ──────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      setSignInStatus('loading')

      // Kimlik bilgisi doğrulama
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setSignInStatus('invalid_credentials')
        return { error: new Error(mapAuthError(authError.message)) }
      }

      if (!data.user) {
        setSignInStatus('error')
        return { error: new Error('Giriş başarısız oldu. Lütfen tekrar deneyin.') }
      }

      // Admin profili kontrolü
      const result = await fetchAdminProfile(data.user.id)

      if (result === 'admin') {
        setIsAdmin(true)
        setSignInStatus('success')
        return { error: null }
      }

      // Yetkisiz — oturumu hemen kapat
      await supabase.auth.signOut()
      setIsAdmin(false)

      if (result === 'inactive') {
        setSignInStatus('inactive_admin')
        return {
          error: new Error(
            'Bu hesap devre dışı bırakılmıştır. Yönetici ile iletişime geçin.'
          ),
        }
      }

      // not_found veya error
      setSignInStatus('not_admin')
      return {
        error: new Error('Bu hesabın yönetici yetkisi bulunmamaktadır.'),
      }
    },
    []
  )

  // ─── Çıkış ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setUser(null)
    setSession(null)
    setSignInStatus('idle')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signInStatus,
        signIn,
        signOut,
        clearSignInStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
