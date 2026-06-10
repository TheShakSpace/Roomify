interface AuthState {
    isSignedIn: boolean;
    userName: string | null,
    userId: string | null,
}

type AuthContext = {
    isSignedIn: boolean;
    userName: string | null,
    userId: dtring | null,
    refreshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;

}