import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";

export const NotFound = () => {
  return (
    <Card className="not-found">
      <h2>Page not found</h2>
      <Link to="/">Go back</Link>
    </Card>
  );
};
