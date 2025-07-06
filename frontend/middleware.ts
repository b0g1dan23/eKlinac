import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/teachers')) {
        const cookieStore = await cookies();
        const teacherToken = cookieStore.get('access_token');
        if (!teacherToken) {
            // Redirect to login page if no teacher token is found
            return NextResponse.redirect(new URL('/auth?redirect=/teachers', request.url));
        }
        console.log(`Samo da javim da middleware radi :: ${teacherToken}`);
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/teachers/:path*', '/teachers'],
}