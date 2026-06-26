import { redirect } from "next/navigation";

export default function InstructorGroupsRedirect() {
  redirect("/instructor/classes");
}
