import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            role: {
              include: {
                permissions: true
              }
            },
            customPermissions: true
          }
        })

        if (!user) {
          return null
        }

        if (user.isActive === false) {
          return null
        }

        const isPasswordValid = await compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        const rolePerms = user.role?.permissions || []
        const customPerms = user.customPermissions || []
        const allPerms = [...rolePerms, ...customPerms]
        const permissions = allPerms.map(p => p.name)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name || 'UNKNOWN',
          permissions
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
})