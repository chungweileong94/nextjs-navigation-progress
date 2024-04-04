import { NavProgressLink } from "@/components/nav-progress";
import { Button } from "@/components/ui/button";

export default async function NextPage() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (
    <main className="p-8">
      <h1 className="pb-4">This is next page</h1>
      <Button asChild>
        <NavProgressLink href="/">Go Back</NavProgressLink>
      </Button>
    </main>
  );
}
