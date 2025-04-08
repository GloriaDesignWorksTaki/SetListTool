import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "text", placeholder: "メールアドレス" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        return { id: "1", email: credentials?.email };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
}); 