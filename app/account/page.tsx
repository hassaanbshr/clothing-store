import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">
        Profile
      </h1>
      <ProfileForm
        name={(session.user as { name?: string }).name ?? ""}
        email={session.user.email ?? ""}
      />
    </div>
  );
}
