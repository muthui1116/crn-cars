import { auth } from "../../auth";
import { redirect } from "next/navigation";

export const ROLES = {
	ADMIN: 1,
	CUSTOMER: 2,
} as const;

// Use inside Server Components or the top of a protected page
export async function requireAdmin() {
	const session = await auth();

	if (!session?.user?.id || session.user.role !== ROLES.ADMIN) {
		redirect("/login");
	}

	return session;
}

// Use inside Server Actions where you want a boolean instead of a redirect
export async function isAdmin() {
	const session = await auth();
	return Boolean(session?.user?.id) && session?.user.role === ROLES.ADMIN;
}

export async function requireAuth() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}
	return session as NonNullable<typeof session>;
}