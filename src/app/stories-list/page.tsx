import { redirect } from "next/navigation";

/** Legacy route — canonical stories browser lives at /stories */
export default function StoriesListRedirect() {
  redirect("/stories");
}
