import Link from "next/link";

export const Nav = () => (
  <div>
    <h1>Hotel Geek</h1>
    <Link href="/hotels/europe">
      <a>Europe</a>
    </Link>
    |
    <Link href="/hotels/portugal">
      <a>Portugal</a>
    </Link>
  </div>
);
