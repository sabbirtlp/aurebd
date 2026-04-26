export default function Loading() {
  return (
    <div className="container" style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      <div className="nm-card" style={{ padding: "2rem", borderRadius: "50%" }}>
        <div className="animate-pulse" style={{ color: "var(--primary)", fontWeight: "600" }}>
          Loading Aurea...
        </div>
      </div>
    </div>
  );
}
