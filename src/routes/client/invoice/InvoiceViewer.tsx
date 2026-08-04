import { Link, useParams } from "react-router-dom";

const InvoiceViewer = () => {
    const { projectID } = useParams();
  return (
    <section className="min-h-screen">
      <Link to="/transactions">Go back</Link>
      <h1 className="text-center">
        Your viewing project Invoice for project with ID of:{" "}
        <span className="text-2xl bg-red-500 p-4 text-white">{ projectID }</span>
      </h1>
    </section>
  );
}

export default InvoiceViewer;