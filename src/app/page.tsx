import { NavProgressLink } from "@/components/nav-progress";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-8">
      <Button asChild>
        <NavProgressLink href="/next">Next Page</NavProgressLink>
      </Button>
    </main>
  );
}
