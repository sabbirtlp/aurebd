
async function testUpload() {
  const formData = new FormData();
  const blob = new Blob(["test"], { type: "image/png" });
  formData.append("file", blob, "test.png");

  const res = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log(data);
}

// This is just for my reference, I can't run it here easily.
