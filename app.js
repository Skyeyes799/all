document.addEventListener("DOMContentLoaded", () => {
  // ==== ELEMENTS ====
  const connectButton = document.getElementById("connectButton");
  const walletAddressDisplay = document.getElementById("walletAddress");
  const fileInput = document.getElementById("fileInput");
  const signButton = document.getElementById("signButton");
  const storeButton = document.getElementById("storeButton");
  const verifyButton = document.getElementById("verifyButton");
  const fetchAudit = document.getElementById("fetchAudit");
  const encryptToggle = document.getElementById("encryptToggle");
  const signatureOutput = document.getElementById("signatureOutput");
  const verificationOutput = document.getElementById("verificationOutput");
  const output = document.getElementById("output");
  const aesKeyBox = document.getElementById("aesKeyBox");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingText = document.getElementById("loadingText");
  const verifyStatus = document.getElementById("verifyStatus"); // ✅ Ensure exists in HTML

  let provider, signer, contract, userAddress;
  let fileSignatures = {};

  // ✅ Pinata JWT
  const PINATA_JWT =
    "PINATA CLOUD";
  const contractAddress = "REMIX ORG";
  const contractABI = [
    {
      inputs: [
        { internalType: "bytes32", name: "fileHash", type: "bytes32" },
        { internalType: "string", name: "cid", type: "string" },
        { internalType: "string", name: "signature", type: "string" },
      ],
      name: "storeFile",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "fileHash", type: "bytes32" }],
      name: "verifyFile",
      outputs: [
        { internalType: "bool", name: "exists", type: "bool" },
        { internalType: "string", name: "cid", type: "string" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "uint256", name: "timestamp", type: "uint256" },
        { internalType: "string", name: "signature", type: "string" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllFileHashes",
      outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  // ==== UTILITY FUNCTIONS ====
  async function showLoading(text = "Processing...") {
    loadingText.textContent = text;
    loadingOverlay.style.display = "flex";
  }

  function hideLoading() {
    loadingOverlay.style.display = "none";
  }

  async function calculateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // ==== AES HELPERS ====
  async function generateKey() {
    return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ]);
  }

  async function encryptFile(file, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const meta = JSON.stringify({ name: file.name, type: file.type });
    const metaBytes = new TextEncoder().encode(meta);
    const fileBuffer = await file.arrayBuffer();
    const combined = new Uint8Array(metaBytes.length + 1 + fileBuffer.byteLength);
    combined.set(metaBytes, 0);
    combined[metaBytes.length] = 0;
    combined.set(new Uint8Array(fileBuffer), metaBytes.length + 1);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, combined);
    const keyData = await crypto.subtle.exportKey("jwk", key);
    return { encrypted: new Blob([iv, new Uint8Array(encrypted)]), keyData };
  }

  async function decryptFile(encryptedBlob, keyData) {
    const key = await crypto.subtle.importKey("jwk", keyData, { name: "AES-GCM" }, true, ["decrypt"]);
    const buffer = await encryptedBlob.arrayBuffer();
    const iv = new Uint8Array(buffer.slice(0, 12));
    const data = buffer.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    const bytes = new Uint8Array(decrypted);
    const nullIndex = bytes.indexOf(0);
    const meta = JSON.parse(new TextDecoder().decode(bytes.slice(0, nullIndex)));
    const fileBytes = bytes.slice(nullIndex + 1);
    const blob = new Blob([fileBytes], { type: meta.type });
    blob.fileName = meta.name;
    return blob;
  }

  // ==== WALLET CONNECT ====
  connectButton.addEventListener("click", async () => {
    if (!window.ethereum) return alert("⚠️ MetaMask not detected!");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      walletAddressDisplay.textContent = `✅ Connected: ${userAddress}`;
    } catch (err) {
      alert("❌ Wallet connect error: " + err.message);
    }
  });

  // ==== SIGN FILE ====
  signButton.addEventListener("click", async () => {
    if (!signer) return alert("⚠️ Connect wallet first!");
    const files = Array.from(fileInput.files);
    for (const file of files) {
      const hash = await calculateFileHash(file);
      const signature = await signer.signMessage(hash);
      fileSignatures[file.name] = signature;
    }
    signatureOutput.textContent = "🖋️ Files signed successfully.";
  });

  // ==== UPLOAD TO PINATA ====
 async function uploadToPinata(file) {
  try {
    if (!PINATA_JWT || PINATA_JWT.trim() === "") {
      throw new Error("Pinata JWT is missing.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT.trim()}`
        },
        body: formData
      }
    );

    const responseText = await response.text();
    console.log("Pinata Status:", response.status);
    console.log("Pinata Response:", responseText);

    if (!response.ok) {
      throw new Error(`Pinata upload failed (${response.status})`);
    }

    const data = JSON.parse(responseText);

    if (!data.IpfsHash) {
      throw new Error("Invalid response from Pinata.");
    }

    return data.IpfsHash;

  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
}
  // ==== STORE FILE ====
storeButton.addEventListener("click", async () => {
  if (!contract) return alert("⚠️ Connect wallet first!");
  const files = Array.from(fileInput.files);

  for (const file of files) {
    try {
      showLoading("Encrypting and uploading file...");

      // 🚫 Check if file is signed
      if (!fileSignatures[file.name]) {
        alert(`⚠️ Please sign "${file.name}" before uploading.`);
        hideLoading();
        continue;
      }

      const hashBytes32 = "0x" + (await calculateFileHash(file));
      const [exists] = await contract.verifyFile(hashBytes32);
      if (exists) {
        hideLoading();
        output.innerHTML += `<p>⚠️ "${file.name}" already exists on blockchain.</p>`;
        continue;
      }

      let cid, keyString;
      const encryptBeforeUpload = encryptToggle?.checked ?? true;

      if (encryptBeforeUpload) {
        const aesKey = await generateKey();
        const { encrypted, keyData } = await encryptFile(file, aesKey);
        keyString = btoa(unescape(encodeURIComponent(JSON.stringify(keyData))));
        cid = await uploadToPinata(encrypted);
      } else {
        cid = await uploadToPinata(file);
      }

      showLoading("Waiting for blockchain confirmation...");
      const signature = fileSignatures[file.name];
      const tx = await contract.storeFile(hashBytes32, cid, signature, { gasLimit: 500000 });
      await tx.wait();

      hideLoading();

      if (encryptBeforeUpload) {
        aesKeyBox.value = keyString;
        document.getElementById("keyModal").style.display = "flex";
      }

      output.innerHTML += `<p>✅ Stored ${file.name} | CID: ${cid}</p>`;
    } catch (err) {
      hideLoading();
      output.innerHTML += `<p>❌ Error: ${err.message}</p>`;
    }
  }
});


  // ==== VERIFY FILE ====
  verifyButton.addEventListener("click", async () => {
    if (!contract) return alert("⚠️ Connect wallet first!");
    const files = Array.from(fileInput.files);
    verificationOutput.innerHTML = "";
    verifyStatus.style.display = "none";

    if (files.length === 0) return alert("📁 Please select at least one file to verify.");

    for (const file of files) {
      showLoading("Verifying file on blockchain...");
      try {
        const hashBytes32 = "0x" + (await calculateFileHash(file));
        const [exists, cid, owner, timestamp, signature] = await contract.verifyFile(hashBytes32);
        hideLoading();
        if (exists) {
          const date = new Date(Number(timestamp) * 1000).toLocaleString();
          verificationOutput.innerHTML += `
            ✅ <b>${file.name}</b><br>
            👤 ${owner}<br>
            🕒 ${date}<br>
            📦 ${cid}<br>
            ✍️ ${signature}<br><br>`;
          verifyStatus.textContent = `✅ File "${file.name}" verified successfully!`;
          verifyStatus.className = "verify-alert verify-success";
        } else {
          verifyStatus.textContent = `❌ Integrity Verification Failed. File "${file.name}" not registered or has been modified.`;
          verifyStatus.className = "verify-alert verify-fail";
        }
        verifyStatus.style.display = "block";
setTimeout(() => (verifyStatus.style.display = "none"), 12000);
      } catch (err) {
        hideLoading();
        verificationOutput.innerHTML += `❌ ${err.message}<br>`;
      }
    }
  });

  // ==== FETCH AUDIT ====
  fetchAudit.addEventListener("click", async () => {
    if (!contract) return alert("⚠️ Connect wallet first!");
    showLoading("Fetching blockchain data...");
    try {
      const hashes = await contract.getAllFileHashes();
      hideLoading();
      if (hashes.length === 0) {
        output.innerHTML = "⚠️ No files stored.";
        return;
      }
      output.innerHTML = `<h3>📜 Blockchain Audit Trail</h3>`;
      for (let i = hashes.length - 1; i >= 0; i--) {
        const hash = hashes[i];
        const [exists, cid, owner, timestamp, signature] = await contract.verifyFile(hash);
        if (!exists) continue;
        const date = new Date(Number(timestamp) * 1000).toLocaleString();
        output.innerHTML += `
          <div style="background:#f8fafc;padding:10px;border-radius:10px;margin-bottom:10px;">
            📦 CID: ${cid}<br>
            👤 Owner: ${owner}<br>
            🕒 ${date}<br>
            ✍️ ${signature}<br>
            <button onclick="downloadAndDecrypt('${cid}')">⬇️ Download & Decrypt</button>
          </div>`;
      }
    } catch (err) {
      hideLoading();
      output.innerHTML = "❌ " + err.message;
    }
  });

  // ==== DOWNLOAD & DECRYPT ====
  window.downloadAndDecrypt = async (cid) => {
    const keyInput = prompt("🔑 Enter your AES decryption key:");
    if (!keyInput) return alert("❌ Key required.");
    try {
      showLoading("Decrypting file...");
      const keyData = JSON.parse(decodeURIComponent(escape(atob(keyInput.trim()))));
      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const blob = await res.blob();
      const decrypted = await decryptFile(blob, keyData);
      hideLoading();
      const url = URL.createObjectURL(decrypted);
      const a = document.createElement("a");
      a.href = url;
      a.download = decrypted.fileName || "decrypted_file";
      a.click();
      URL.revokeObjectURL(url);
      alert("✅ File decrypted and downloaded successfully!");
    } catch (err) {
      hideLoading();
      alert("❌ Decryption failed: " + err.message);
    }
  };

  // ==== COPY AES KEY ====
  document.getElementById("copyKey").addEventListener("click", async () => {
    const keyField = document.getElementById("aesKeyBox");
    await navigator.clipboard.writeText(keyField.value);
    const status = document.getElementById("copyStatus");
    status.style.display = "block";
    setTimeout(() => (status.style.display = "none"), 2000);
  });

  // ==== CLEAR OUTPUT ====
   document.getElementById("clearOutput").addEventListener("click", () => {
    output.innerHTML = "🧾 Logs cleared.";
    setTimeout(()=>{
      output.innerHTML="";
    },4000);
  });
});
