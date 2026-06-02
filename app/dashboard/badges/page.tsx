import { redirect } from "next/navigation";

export default function BadgesRedirectPage() {
  redirect("/dashboard?nav=badges");
}
