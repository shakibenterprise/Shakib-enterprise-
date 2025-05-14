    /*/ Firebase App Initialization
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
    import { getAuth, signOut} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
    import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    getDoc,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    serverTimestamp
  } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyACFf60qa7Udvz9Xn8GN6vu9V_BkQzdovk",
      authDomain: "shakib-enterprise-6df83.firebaseapp.com",
      databaseURL: "https://shakib-enterprise-6df83-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "shakib-enterprise-6df83",
      storageBucket: "shakib-enterprise-6df83.appspot.com",
      messagingSenderId: "957943781117",
      appId: "1:957943781117:web:af41a45c8a202fdb52d094"
    };

    // Initialize Firebase App
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();  // Retrieve Firebase Auth instance
    // Firestore ইন্সট্যান্স তৈরি করুন
    const db = getFirestore(app);



// পপাপে প্রডাক্টের নাম দেখাবে 
// Firestore থেকে কোম্পানির নাম নিয়ে <select> এ দেখানো
async function loadCompanyNames() {
    const companySelect = document.getElementById("companySelect");
    companySelect.innerHTML = ""; // আগের অপশন মুছে ফেলবে

    const querySnapshot = await getDocs(collection(db, "companyAll"));
    querySnapshot.forEach((doc) => {
        const companyName = doc.id.replace(/_/g, " "); // "_" -> " " পরিবর্তন
        const option = document.createElement("option");
        option.value = doc.id; // ডকুমেন্ট আইডি রাখবে (যেটা Firestore এ আছে)
        option.textContent = companyName; // দেখাবে ফরম্যাট করা নাম
        companySelect.appendChild(option);
    });

    // প্রথম কোম্পানি সিলেক্ট থাকলে লোড করবে
    if (companySelect.options.length > 0) {
        loadProductList(companySelect.value);
    }
}

// কোম্পানি সিলেক্ট করলে প্রডাক্ট লোড হবে
async function loadProductList(selectedCompany) {
    const productListDiv = document.getElementById("productList");
    productListDiv.innerHTML = ""; // আগের ডাটা মুছে ফেলবে

    const companyRef = doc(db, "companyAll", selectedCompany);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) return;

    const companyData = companySnap.data();
    const products = [];

    // সকল অ্যারে থেকে প্রডাক্টের নাম বের করা
    Object.keys(companyData).forEach((productNumber) => {
        if (companyData[productNumber].productName) {
            products.push({
                productNumber: productNumber,
                productName: companyData[productNumber].productName,
            });
        }
    });

    // **প্রডাক্ট নাম্বার অনুযায়ী সাজানো (Serial Order)**
    products.sort((a, b) => a.productNumber - b.productNumber);

    // প্রডাক্ট লিস্ট তৈরি করা
    products.forEach((product) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = product.productNumber;

        const label = document.createElement("label");
        label.textContent = product.productName;
        label.style.marginLeft = "5px";

        const div = document.createElement("div");
        div.appendChild(checkbox);
        div.appendChild(label);

        productListDiv.appendChild(div);
    });
}

// সিলেক্ট অপশন পরিবর্তন হলে নতুন প্রডাক্ট লোড করবে
document.getElementById("companySelect").addEventListener("change", function () {
    loadProductList(this.value);
});

// **পেজ লোড হলে কোম্পানি নাম লোড হবে**
document.addEventListener("DOMContentLoaded", loadCompanyNames);



// পপআপ ওপেন হলে প্রডাক্ট লোড করার জন্য কল করা হবে
window.openProductPopup = function () {
  document.getElementById("productPopup").style.display = "block";
    // প্রডাক্ট লোড করো ফায়ারস্টোর থেকে
};

// পপআপ বন্ধ করার জন্য
window.closeProductPopup = function () {
  document.getElementById("productPopup").style.display = "none";
};

// সিলেক্ট করা প্রডাক্টের জন্য টেবিল রো যোগ করা
window.generateTables = async function () {
    const companySelect = document.getElementById("companySelect");
    const selectedCompany = companySelect.value; // নির্বাচিত কোম্পানি
    const formattedCompanyName = selectedCompany.replace(/_/g, " "); // "_" -> " " পরিবর্তন
    const productListDiv = document.getElementById("productList");
    const checkboxes = productListDiv.querySelectorAll("input[type='checkbox']:checked");

    if (checkboxes.length === 0) {
        alert("দয়া করে অন্তত একটি প্রডাক্ট সিলেক্ট করুন!");
        return;
    }

    const table = document.getElementById("mainTable"); // HTML-এ থাকা মূল টেবিল
    let existingTbody = document.getElementById(formattedCompanyName); // আগের টিবডি আছে কিনা চেক করবে

    if (existingTbody) {
        alert(`"${formattedCompanyName}" কোম্পানির তথ্য ইতিমধ্যেই টেবিলে আছে!`);
        return;
    }

    // নতুন tbody তৈরি করবে
    const tbody = document.createElement("tbody");
    tbody.id = formattedCompanyName; // টিবডির ID হবে কোম্পানির নাম

    // কোম্পানি নামের জন্য একটি রো তৈরি করবে
    const companyRow = document.createElement("tr");
    const companyCell = document.createElement("td");
    companyCell.setAttribute("colspan", "11");
    companyCell.innerHTML = `<strong>${formattedCompanyName}</strong>`;
    companyRow.appendChild(companyCell);
    tbody.appendChild(companyRow);

    const companyRef = doc(db, "companyAll", selectedCompany);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) return;
    const companyData = companySnap.data();

    let serialNumber = 1;

    // সিলেক্টেড প্রোডাক্টের জন্য রো তৈরি করবে
    checkboxes.forEach((checkbox) => {
        const productNumber = checkbox.value;
        const productData = companyData[productNumber];

        if (!productData) return;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${productData.productNumber}</td>
            <td>${productData.productName}</td>
            <td><input type="text" placeholder="অর্ডার"></td>
            <td><input type="text" placeholder="ফেরত"></td>
            <td></td>
            <td>${productData.sellingPrice}</td>
            <td></td>
            <td>${productData.stockQuantity}</td>
            <td><input type="text" placeholder="ডেমেজ"></td>
            <td></td>
            <td>
                <button class="option-btn delete-btn" onclick="deleteRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="option-btn edit-btn" onclick="editRow(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="option-btn equal-btn" onclick="equalFunction(this)">
                    <i class="fas fa-equals"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // **শেষে মোট হিসাবের জন্য একটি রো যোগ করা**
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
             <td colspan="2">
    <div class="placeholder-container">
        <label>মোট বিক্রি</label>
        <input type="text" id="totalSellInput" placeholder=" ">
    </div>
</td>
<td colspan="2">
    <div class="placeholder-container">
        <label>মোট ডেমেজ</label>
        <input type="text" id="totalDamageInput" placeholder=" ">
    </div>
</td>
<td colspan="2" id="motTaka">
    <div class="placeholder-container">
        <label>মোট টাকা</label>
        <input type="text" id="totalAmountInput" placeholder=" ">
    </div>
</td>
<td><button class="eql" onclick="equalFunction(this)"> 
<i class="fas fa-equals"></i>
</button></td>


    `;
    tbody.appendChild(totalRow);

    // মূল টেবিলে `tbody` যোগ করা হবে
    table.appendChild(tbody);
};

window.deleteRow = function (button) {
    // ব্যবহারকারীর কনফার্মেশন চাওয়া
    if (confirm("আপনি কি নিশ্চিত যে আপনি এই সারিটি মুছতে চান?")) {
        // টেবিলের সারি খোঁজা এবং ডিলিট করা
        let row = button.closest("tr"); // ক্লিক করা বাটনের টেবিল রো খুঁজে বের করা
        row.remove(); // রো ডিলিট করা
    }
}


// রো এডিট করার জন্য ফাংশন (আপনার প্রয়োজন অনুযায়ী কাস্টমাইজ করুন)
window.editRow = function (button) {
    alert("Edit functionality not implemented yet!");
};

// সমান কাজের জন্য ফাংশন (আপনার প্রয়োজন অনুযায়ী কাস্টমাইজ করুন)

// ডেট সিলেক্টেড
document.addEventListener("DOMContentLoaded", function () {
    let orderDateInput = document.getElementById("orderDate");

    orderDateInput.addEventListener("change", function () {
        let dateValue = this.value; // yyyy-mm-dd ফরম্যাটে ডেট পাবে
        if (dateValue) {
            let parts = dateValue.split("-");
            let formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy ফরম্যাট
            this.type = "text"; // ইনপুট টাইপ টেক্সট করে দিচ্ছে
            this.value = formattedDate; // নতুন ফরম্যাটে ডেট ইনপুটে সেট করছে
        }
    });

    orderDateInput.addEventListener("focus", function () {
        this.type = "date"; // ইনপুটে ক্লিক করলে আবার Date Picker দেখাবে
    });
});

// মোট টাকা যোগ করবে 
window.calculateTotalSell = function () {
    let total = 0;
    let tables = document.querySelectorAll("#mainTable tbody"); // সব টেবিল খুঁজে বের করা

    tables.forEach(table => {
        let motTakaInput = table.querySelector(" td#motTaka input"); // tfoot-এর motTaka থাকা td এর ইনপুট খোঁজা
        if (motTakaInput && !isNaN(motTakaInput.value)) {
            total += parseFloat(motTakaInput.value) || 0; // মান যোগ করা
        }
    });

    document.getElementById("totalSell").value = total.toFixed(2); // নেভবারের ইনপুটে দেখানো
}

// জমা বাকি হিসাব
document.getElementById("dueAmount").addEventListener("focus", function () {
    let totalSell = parseFloat(document.getElementById("totalSell").value) || 0;
    let joma = parseFloat(document.getElementById("joma").value) || 0;
    let due = totalSell - joma;

    this.value = due.toFixed(2); // dueAmount ইনপুটে মান সেট করা
});

window.equalFunction = function (button) {
    // ক্লোজেস্ট টেবিল খুঁজে বের করা
    const table = button.closest("tbody");

    if (!table) {
        console.error("টেবিল পাওয়া যায়নি!");
        return;
    }

    let totalSell = 0;
    let totalDamageCost = 0;

    // প্রতিটি রো লুপ করে কাজ করবে
    table.querySelectorAll("tr").forEach((row, index) => {
        // প্রথম রো (হেডিং) ও শেষের মোট রো বাদ দিতে হবে
        if (index === 0 || row.querySelector("strong")) return; 

        // প্রতিটি কলামের ইনপুট খুঁজে বের করা
        const orderInput = row.cells[2]?.querySelector("input");
        const returnInput = row.cells[3]?.querySelector("input");
        const sellCell = row.cells[4];
        const priceCell = row.cells[5];
        const totalSellCell = row.cells[6];
        const damageInput = row.cells[8]?.querySelector("input");
        const damageCostCell = row.cells[9];

        // যদি কোনো কলাম না থাকে তাহলে স্কিপ করবে
        if (!orderInput || !returnInput || !sellCell || !priceCell || !totalSellCell || !damageInput || !damageCostCell) {
            return;
        }

        let order = parseFloat(orderInput.value) || 0;
        let returned = parseFloat(returnInput.value) || 0;
        let price = parseFloat(priceCell.textContent) || 0;
        let damage = parseFloat(damageInput.value) || 0;

        // বিক্রি = অর্ডার - ফেরত
        let sell = order - returned;
        sellCell.textContent = sell; 

        // মোট সেল = বিক্রি * মূল্য
        let totalSellValue = sell * price;
        totalSellCell.textContent = totalSellValue.toFixed(2);
        totalSell += totalSellValue;

        // ডেমমূল্য = ডেমেজ * মূল্য
        let damageCost = damage * price;
        damageCostCell.textContent = damageCost.toFixed(2);
        totalDamageCost += damageCost;
    });

    // টেবিলের মোট বিক্রি, মোট ডেমেজ, মোট টাকা সেট করা
    const totalSellInput = table.querySelector("td[colspan='2'] #totalSellInput");
    const totalDamageInput = table.querySelector("td[colspan='2'] #totalDamageInput");
    const totalAmountInput = table.querySelector("#motTaka input");

    if (totalSellInput) totalSellInput.value = totalSell.toFixed(2);
    if (totalDamageInput) totalDamageInput.value = totalDamageCost.toFixed(2);
    if (totalAmountInput) totalAmountInput.value = (totalSell - totalDamageCost).toFixed(2);
        
}



window.saveTableData = async function () {
    // নেভবার থেকে ইনপুট সংগ্রহ
    const roadName = document.getElementById("roadName").value.trim();
    const dsrName = document.getElementById("dsr-name").value.trim();
    const orderDate = document.getElementById("orderDate").value;
    const totalSell = parseFloat(document.getElementById("totalSell").value) || 0;
    const joma = parseFloat(document.getElementById("joma").value) || 0;
    const dueAmount = parseFloat(document.getElementById("dueAmount").value) || 0;
    const notes = document.getElementById("notes").value.trim();

    // যদি ডিএসআর নাম বা তারিখ খালি থাকে তাহলে স্টপ করবে
    if (!dsrName || !orderDate) {
        alert("দয়া করে ডিএসআর নাম ও তারিখ নির্বাচন করুন!");
        return;
    }

    const formattedDate = orderDate.split("/").join("-"); // dd/mm/yyyy → dd-mm-yyyy
    const docId = `${dsrName}_${formattedDate}`; // ডকুমেন্ট আইডি তৈরি

    const historyRef = doc(db, "History", docId);
    const historySnap = await getDoc(historyRef);

    let confirmUpdate = true;

    if (historySnap.exists()) {
        confirmUpdate = confirm("এই হিসাবটি ইতোমধ্যে বিদ্যমান! আপডেট করতে চান?");
        if (!confirmUpdate) return;
    }

    // হিসাবের স্ট্যাটাস সেট করার জন্য অ্যালার্ট
    const status = confirm("আপনি কি এই হিসাবটিকে **কমপ্লিট** হিসেবে সেট করতে চান?") ? "Complete" : "Incomplete";

    // **প্রত্যেক কোম্পানির জন্য আলাদা অ্যারে তৈরি করা হচ্ছে**
    const tableData = {};

    document.querySelectorAll("#tabliContainer tbody").forEach((tbody) => {
        const companyName = tbody.id;
        if (!companyName) return;

        const rows = tbody.querySelectorAll("tr");
        const productArray = [];

        rows.forEach((row, index) => {
            if (index === 0 || row.querySelector("strong")) return; // কোম্পানি নাম রো বাদ

            const cells = row.cells;

            // লাস্ট রো চেক করা
            if (index === rows.length - 1) {
                const lastRow = {
                    rowName: "lastRow", // লাস্ট রো আলাদা চিহ্নিত করতে
                    totalSell: parseFloat(cells[0]?.querySelector("input")?.value) || 0,
                    totalDamage: parseFloat(cells[1]?.querySelector("input")?.value) || 0,
                    totalAmount: parseFloat(cells[2]?.querySelector("input")?.value) || 0,
                };
                productArray.push(lastRow); // **লাস্ট রোকে আলাদা করে সংরক্ষণ**
                return;
            }

            // সাধারণ রো এর ডাটা
            const productData = {
                productNumber: cells[0]?.textContent.trim() || "",
                productName: cells[1]?.textContent.trim() || "",
                order: parseFloat(cells[2]?.querySelector("input")?.value) || 0,
                returned: parseFloat(cells[3]?.querySelector("input")?.value) || 0,
                sell: parseFloat(cells[4]?.textContent) || 0,
                price: parseFloat(cells[5]?.textContent) || 0,
                totalSell: parseFloat(cells[6]?.textContent) || 0,
                stock: parseFloat(cells[7]?.textContent) || 0,
                damage: parseFloat(cells[8]?.querySelector("input")?.value) || 0,
                damageCost: parseFloat(cells[9]?.textContent) || 0,
            };

            productArray.push(productData);
        });

        // **✅ প্রতিটি কোম্পানির জন্য আলাদা অ্যারে স্টোর করা হচ্ছে**
        tableData[companyName] = productArray;
    });

    // Firestore-এ ডাটা সংরক্ষণ
    await setDoc(historyRef, {
        roadName,
        dsrName,
        orderDate: formattedDate,
        totalSell,
        joma,
        dueAmount,
        status,
        notes, 
        ...tableData, // ✅ এখন প্রতিটি কোম্পানির জন্য আলাদা অ্যারে সংরক্ষণ হবে
    });

    alert("ডাটা সফলভাবে সংরক্ষিত হয়েছে!");
    
 
};


async function fetchDSRNames() {
    try {
        const docRef = doc(db, "workerzone", "dsrall");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            console.log("ডকুমেন্টের ডাটা:", docData);

            // সব নাম সংগ্রহ করা
            const dsrList = Object.values(docData); 
            console.log("ডিএসআর তালিকা:", dsrList);

            // ড্রপডাউন মেনুতে নাম দেখানো
            const dropdownMenu = document.getElementById("dropdown-menu");
            dropdownMenu.innerHTML = ""; // আগের ডাটা মুছুন

            dsrList.forEach(name => {
                let div = document.createElement("div");
                div.textContent = name;
                div.style.padding = "5px";
                div.style.cursor = "pointer";
                div.onclick = () => selectDSR(name);
                dropdownMenu.appendChild(div);
            });

            dropdownMenu.style.display = "block"; // ড্রপডাউন দেখাও

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching DSR names:", error);
    }
}

// ইনপুট বক্সে ক্লিক করলে ড্রপডাউন দেখাবে
window.toggleDropdown = function () {
    let dropdown = document.getElementById("dropdown-menu");

    if (dropdown.style.display === "none") {
        dropdown.style.display = "block";
        fetchDSRNames(); // ফায়ারস্টোর থেকে নাম লোড করবে
    } else {
        dropdown.style.display = "none";
    }
}

// ড্রপডাউন থেকে নাম সিলেক্ট করলে ইনপুট বক্সে সেট হবে এবং মেনু লুকাবে
function selectDSR(name) {
    document.getElementById("dsr-name").value = name;
    document.getElementById("dropdown-menu").style.display = "none";
}



// ড্রাফ্ট পপআপ খুলুন
window.loadDrafts = async function () {
    const draftPopup = document.getElementById("draftPopup");
    const draftList = document.getElementById("draftList");
    draftList.innerHTML = ""; // আগের ডাটা মুছে ফেলবে

    const historyRef = collection(db, "History");
    const querySnapshot = await getDocs(historyRef);

    let hasDrafts = false;
    const uniqueDrafts = new Set(); // **🔹 ডুপ্লিকেট চেক করার জন্য `Set` ব্যবহার করা হচ্ছে**

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Incomplete") {
            const textContent = `${data.dsrName} - ${data.orderDate}`;

            if (!uniqueDrafts.has(textContent)) { // **🔹 যদি একই টেক্সট আগে থেকে না থাকে**
                uniqueDrafts.add(textContent); // **🔹 সেটে যোগ করা হচ্ছে**
                hasDrafts = true;

                const li = document.createElement("li");
                li.textContent = textContent;
                li.dataset.docId = doc.id;

                li.onclick = function () {
                    loadDraftData(doc.id);
                    draftPopup.style.display = "none"; // **🔹 ড্রাফ্ট পপআপ লুকানো হবে**
                };

                draftList.appendChild(li);
            }
        }
    });

    if (!hasDrafts) {
        alert("কোনো Incomplete হিসাব পাওয়া যায়নি!");
        return;
    }

    draftPopup.style.display = "block"; // **🔹 ড্রাফ্ট পপআপ দেখাবে**
};


async function loadDraftData(docId) {
    const historyRef = doc(db, "History", docId);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) {
        alert("ডকুমেন্ট খুঁজে পাওয়া যায়নি!");
        return;
    }

    const data = historySnap.data();
    const table = document.getElementById("mainTable");

    // ✅ **নেভবারের ইনপুট ফিল্ডে ডাটা সেট করা হচ্ছে**
    document.getElementById("roadName").value = data.roadName || "";
    document.getElementById("dsr-name").value = data.dsrName || "";
    Object.assign(document.getElementById("orderDate"), { type: "text", value: data.orderDate || "" });
    document.getElementById("totalSell").value = data.totalSell || 0;
    document.getElementById("joma").value = data.joma || 0;
    document.getElementById("dueAmount").value = data.dueAmount || 0;
    document.getElementById("notes").value = data.notes || "";

    // **📌 Firestore-এ সরাসরি কোম্পানির নাম গুলি লোড করা হচ্ছে**
    const companyNames = Object.keys(data).filter(key => !["roadName", "dsrName", "orderDate", "totalSell", "joma", "dueAmount", "status", "notes"].includes(key));

    // **📌 কোম্পানির নাম অনুযায়ী ডাটা লোড করা**
    for (const companyName of companyNames) {
        const products = data[companyName]; // 🔹 এখন `products` অ্যারে সরাসরি কোম্পানির নামে পাওয়া যাবে
        let tbody = document.getElementById(companyName);

        if (tbody) {
            alert(`${companyName} এর জন্য টেবিল ইতোমধ্যে রয়েছে!`);
            continue;
        }

        // ✅ **নতুন `tbody` তৈরি করা হবে**
        tbody = document.createElement("tbody");
        tbody.id = companyName;

        // ✅ **প্রথম রো কোম্পানি নাম দেখাবে**
        const companyRow = document.createElement("tr");
        companyRow.innerHTML = `<td colspan="11"><strong>${companyName}</strong></td>`;
        tbody.appendChild(companyRow);

        let lastRowData = null; // **মোট হিসাবের জন্য লাস্ট রো সংরক্ষণ করা হবে**

        // ✅ **প্রত্যেকটি প্রোডাক্টের জন্য রো তৈরি হবে**
        products.forEach((productData) => {
            if (productData.rowName === "lastRow") {
                lastRowData = productData; // **মোট হিসাবের জন্য লাস্ট রো সংরক্ষণ করা হচ্ছে**
                return;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${productData.productNumber || ""}</td>
                <td>${productData.productName || ""}</td>
                <td><input type="text" placeholder="অর্ডার" value="${productData.order || ""}"></td>
                <td><input type="text" placeholder="ফেরত" value="${productData.returned || ""}"></td>
                <td>${productData.sell || ""}</td>
                <td>${productData.price || ""}</td>
                <td>${productData.totalSell || ""}</td>
                <td>${productData.stock || ""}</td>
                <td><input type="text" placeholder="ডেমেজ" value="${productData.damage || ""}"></td>
                <td>${productData.damageCost || ""}</td>
                <td>
                    <button class="option-btn delete-btn" onclick="deleteRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="option-btn edit-btn" onclick="editRow(this)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="option-btn equal-btn" onclick="equalFunction(this)">
                        <i class="fas fa-equals"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // ✅ **মোট হিসাবের জন্য লাস্ট রো যোগ করা হচ্ছে**
        if (lastRowData) {
            const totalRow = document.createElement("tr");
            totalRow.innerHTML = `
                <td colspan="2">
                    <div class="placeholder-container">
                        <label>মোট বিক্রি</label>
                        <input type="text" id="totalSellInput" placeholder=" " value="${lastRowData.totalSell || ""}">
                    </div>
                </td>
                <td colspan="2">
                    <div class="placeholder-container">
                        <label>মোট ডেমেজ</label>
                        <input type="text" id="totalDamageInput" placeholder=" " value="${lastRowData.totalDamage || ""}">
                    </div>
                </td>
                <td colspan="2" id="motTaka">
                    <div class="placeholder-container">
                        <label>মোট টাকা</label>
                        <input type="text" id="totalAmountInput" placeholder=" " value="${lastRowData.totalAmount || ""}">
                    </div>
                </td>
                <td>
                    <button class="eql" onclick="equalFunction(this)">
                        <i class="fas fa-equals"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(totalRow);
        }

        // ✅ **টেবিলে `tbody` যোগ করা হচ্ছে**
        table.appendChild(tbody);
    }

    alert("ডাটা সফলভাবে লোড হয়েছে!");
}


// পপআপ বন্ধ করুন
window.closeDraftPopup = function () {
    document.getElementById("draftPopup").style.display = "none";
}

window.updateStockAndDamage = async function () {
    const table = document.getElementById("mainTable"); // টেবিল নির্বাচন
    const tbodies = table.querySelectorAll("tbody"); // সব `tbody` সংগ্রহ

    for (const tbody of tbodies) {
        const companyName = tbody.querySelector("tr:first-child strong")?.textContent.trim(); // কোম্পানির নাম সংগ্রহ
        if (!companyName) continue;

        const formattedCompanyName = companyName.replace(/\s+/g, "_"); // স্পেস পরিবর্তন করে `_`
        const companyRef = doc(db, "companyAll", formattedCompanyName); // Firestore-এ রেফারেন্স তৈরি
        const companySnap = await getDoc(companyRef);

        if (!companySnap.exists()) {
            console.warn(`⚠️ ${companyName} ( ${formattedCompanyName} ) নামের ডকুমেন্ট পাওয়া যায়নি!`);
            continue;
        }

        const companyData = companySnap.data(); // কোম্পানির ডাটা সংগ্রহ

        // **প্রত্যেকটি রো থেকে প্রোডাক্ট ডাটা সংগ্রহ**
        const rows = tbody.querySelectorAll("tr:not(:first-child)"); // প্রথম রো বাদ দিয়ে সব রো নেবে

        for (const row of rows) {
            const cells = row.cells;
            if (cells.length < 10) continue; // যদি যথেষ্ট কলাম না থাকে, তাহলে স্কিপ করবে

            const productNumber = cells[0]?.textContent.trim(); // প্রোডাক্ট নাম্বার সংগ্রহ
            const sellValue = parseFloat(cells[4]?.textContent) || 0; // বিক্রির সংখ্যা
            const damageValue = parseFloat(cells[8]?.querySelector("input")?.value) || 0; // ডেমেজ সংখ্যা

            if (!productNumber || !(productNumber in companyData)) {
                console.warn(`⚠️ ${productNumber} ( ${companyName} ) প্রোডাক্ট পাওয়া যায়নি!`);
                continue;
            }

            // **প্রোডাক্টের ডাটা সংগ্রহ**
            const productData = companyData[productNumber];

            // **স্টক আপডেট**
            const updatedStockQuantity = (parseFloat(productData.stockQuantity) || 0) - sellValue;

            // **ডেমেজ আপডেট**
            const updatedDamage = (parseFloat(productData.damage) || 0) + damageValue;

            // **Firestore-এ ডাটা আপডেট**
            await updateDoc(companyRef, {
                [`${productNumber}.stockQuantity`]: updatedStockQuantity,
                [`${productNumber}.damage`]: updatedDamage
            });

            console.log(`✅ ${companyName} এর ${productNumber} আপডেট হয়েছে!`);
        }
    }

    alert("🔥 স্টক ও ডেমেজ সফলভাবে আপডেট হয়েছে!");
};*/

/***********************
 * hisab.js - Consolidated Offline Updated Version
 ***********************/

// Import required modules from firebase.js and Firebase CDN
import { db, auth, fetchData, saveData } from "./firebase.js";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteField,
  onSnapshot,
runTransaction
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

/***********************
 * 1. Company & Product List Loading
 ***********************/
async function loadCompanyNames() {
  const companySelect = document.getElementById("companySelect");
  companySelect.innerHTML = "";
  // Offline support: if offline, use cached data
  const querySnapshot = await getDocs(collection(db, "companyAll"), navigator.onLine ? {} : { source: "cache" });
  querySnapshot.forEach((docSnap) => {
    const companyName = docSnap.id.replace(/_/g, " ");
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = companyName;
    companySelect.appendChild(option);
  });
  if (companySelect.options.length > 0) {
    loadProductList(companySelect.value);
  }
}

async function loadProductList(selectedCompany) {
  const productListDiv = document.getElementById("productList");
  productListDiv.innerHTML = "";
  const companyRef = doc(db, "companyAll", selectedCompany);
  const companySnap = await getDoc(companyRef, navigator.onLine ? {} : { source: "cache" });
  if (!companySnap.exists()) return;
  const companyData = companySnap.data();
  const products = [];
  Object.keys(companyData).forEach((productNumber) => {
    if (companyData[productNumber].productName) {
      products.push({
        productNumber,
        productName: companyData[productNumber].productName
      });
    }
  });
  products.sort((a, b) => a.productNumber - b.productNumber);
  products.forEach((product) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = product.productNumber;
    const label = document.createElement("label");
    label.textContent = product.productName;
    label.style.marginLeft = "5px";
    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);
    productListDiv.appendChild(div);
  });
}

document.getElementById("companySelect").addEventListener("change", function () {
  loadProductList(this.value);
});

document.addEventListener("DOMContentLoaded", loadCompanyNames);

/***********************
 * 2. Product Popup Open/Close
 ***********************/
window.openProductPopup = function () {
  document.getElementById("productPopup").style.display = "block";
};

window.closeProductPopup = function () {
  document.getElementById("productPopup").style.display = "none";
};

/***********************
 * 3. Generate Tables for Selected Products
 ***********************/
window.generateTables = async function () {
  const companySelect = document.getElementById("companySelect");
  const selectedCompany = companySelect.value;
  const formattedCompanyName = selectedCompany.replace(/_/g, " ");
  const productListDiv = document.getElementById("productList");
  const checkboxes = productListDiv.querySelectorAll("input[type='checkbox']:checked");
  if (checkboxes.length === 0) {
    alert("দয়া করে অন্তত একটি প্রডাক্ট সিলেক্ট করুন!");
    return;
  }
  const table = document.getElementById("mainTable");
  let existingTbody = document.getElementById(formattedCompanyName);
  if (existingTbody) {
    alert(`"${formattedCompanyName}" কোম্পানির তথ্য ইতোমধ্যেই টেবিলে আছে!`);
    return;
  }
  const tbody = document.createElement("tbody");
  tbody.id = formattedCompanyName;
  const companyRow = document.createElement("tr");
  const companyCell = document.createElement("td");
  companyCell.setAttribute("colspan", "11");
  companyCell.innerHTML = `<strong>${formattedCompanyName}</strong>`;
  companyRow.appendChild(companyCell);
  tbody.appendChild(companyRow);
  const companyRef = doc(db, "companyAll", selectedCompany);
  const companySnap = await getDoc(companyRef, navigator.onLine ? {} : { source: "cache" });
  if (!companySnap.exists()) return;
  const companyData = companySnap.data();
  checkboxes.forEach((checkbox) => {
    const productNumber = checkbox.value;
    const productData = companyData[productNumber];
    if (!productData) return;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${productData.productNumber}</td>
      <td>${productData.productName}</td>
      <td><input type="text" placeholder="অর্ডার"></td>
      <td><input type="text" placeholder="ফেরত"></td>
      <td></td>
      <td>${productData.sellingPrice}</td>
      <td></td>
      <td>${productData.stockQuantity}</td>
      <td><input type="text" placeholder="ডেমেজ"></td>
      <td></td>
      <td>
          <button class="option-btn delete-btn" onclick="deleteRow(this)">
              <i class="fas fa-trash"></i>
          </button>
          <button class="option-btn edit-btn" onclick="editRow(this)">
              <i class="fas fa-edit"></i>
          </button>
          <button class="option-btn equal-btn" onclick="equalFunction(this)">
              <i class="fas fa-equals"></i>
          </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  // Add total row at the end
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="2">
      <div class="placeholder-container">
        <label>মোট বিক্রি</label>
        <input type="text" id="totalSellInput" placeholder=" ">
      </div>
    </td>
    <td colspan="2">
      <div class="placeholder-container">
        <label>মোট ডেমেজ</label>
        <input type="text" id="totalDamageInput" placeholder=" ">
      </div>
    </td>
    <td colspan="2" id="motTaka">
      <div class="placeholder-container">
        <label>মোট টাকা</label>
        <input type="text" id="totalAmountInput" placeholder=" ">
      </div>
    </td>
    <td>
      <button class="eql" onclick="equalFunction(this)">
        <i class="fas fa-equals"></i>
      </button>
    </td>
  `;
  tbody.appendChild(totalRow);
  table.appendChild(tbody);
};

window.deleteRow = function (button) {
  if (confirm("আপনি কি নিশ্চিত যে আপনি এই সারিটি মুছতে চান?")) {
    let row = button.closest("tr");
    row.remove();
  }
};

window.editRow = function (button) {
  alert("Edit functionality not implemented yet!");
};

/***********************
 * 4. Date Input Formatting
 ***********************/
document.addEventListener("DOMContentLoaded", function () {
  let orderDateInput = document.getElementById("orderDate");
  orderDateInput.addEventListener("change", function () {
    let dateValue = this.value;
    if (dateValue) {
      let parts = dateValue.split("-");
      let formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      this.type = "text";
      this.value = formattedDate;
    }
  });
  orderDateInput.addEventListener("focus", function () {
    this.type = "date";
  });
});

/***********************
 * 5. Calculate Total Sell, Damage & Amount
 ***********************/
window.calculateTotalSell = function () {
  let total = 0;
  let tables = document.querySelectorAll("#mainTable tbody");
  tables.forEach(table => {
    let motTakaInput = table.querySelector("td#motTaka input");
    if (motTakaInput && !isNaN(motTakaInput.value)) {
      total += parseFloat(motTakaInput.value) || 0;
    }
  });
  document.getElementById("totalSell").value = total.toFixed(2);
};

document.getElementById("dueAmount").addEventListener("focus", function () {
  let totalSell = parseFloat(document.getElementById("totalSell").value) || 0;
  let joma = parseFloat(document.getElementById("joma").value) || 0;
  let due = totalSell - joma;
  this.value = due.toFixed(2);
});

window.equalFunction = function (button) {
  const table = button.closest("tbody");
  if (!table) {
    console.error("টেবিল পাওয়া যায়নি!");
    return;
  }
  let totalSell = 0;
  let totalDamageCost = 0;
  table.querySelectorAll("tr").forEach((row, index) => {
    if (index === 0 || row.querySelector("strong")) return;
    const orderInput = row.cells[2]?.querySelector("input");
    const returnInput = row.cells[3]?.querySelector("input");
    const sellCell = row.cells[4];
    const priceCell = row.cells[5];
    const totalSellCell = row.cells[6];
    const damageInput = row.cells[8]?.querySelector("input");
    const damageCostCell = row.cells[9];
    if (!orderInput || !returnInput || !sellCell || !priceCell || !totalSellCell || !damageInput || !damageCostCell) return;
    let order = parseFloat(orderInput.value) || 0;
    let returned = parseFloat(returnInput.value) || 0;
    let price = parseFloat(priceCell.textContent) || 0;
    let damage = parseFloat(damageInput.value) || 0;
    let sell = order - returned;
    sellCell.textContent = sell;
    let totalSellValue = sell * price;
    totalSellCell.textContent = totalSellValue.toFixed(2);
    totalSell += totalSellValue;
    let damageCost = damage * price;
    damageCostCell.textContent = damageCost.toFixed(2);
    totalDamageCost += damageCost;
  });
  const totalSellInput = table.querySelector("td[colspan='2'] #totalSellInput");
  const totalDamageInput = table.querySelector("td[colspan='2'] #totalDamageInput");
  const totalAmountInput = table.querySelector("#motTaka input");
  if (totalSellInput) totalSellInput.value = totalSell.toFixed(2);
  if (totalDamageInput) totalDamageInput.value = totalDamageCost.toFixed(2);
  if (totalAmountInput) totalAmountInput.value = (totalSell - totalDamageCost).toFixed(2);
};

/***********************
 * 6. Save Table Data (History) with Offline Support
 ***********************/

window.saveTableData = async function () {
  // ইনপুট ফিল্ড থেকে মান সংগ্রহ
  const roadName = document.getElementById("roadName").value.trim();
  const dsrName = document.getElementById("dsr-name").value.trim();
  const orderDate = document.getElementById("orderDate").value;
  const totalSell = parseFloat(document.getElementById("totalSell").value) || 0;
  const joma = parseFloat(document.getElementById("joma").value) || 0;
  const dueAmount = parseFloat(document.getElementById("dueAmount").value) || 0;
  const notes = document.getElementById("notes").value.trim();

  if (!dsrName || !orderDate) {
    alert("দয়া করে ডিএসআর নাম ও তারিখ নির্বাচন করুন!");
    return;
  }

  // তারিখের ফরম্যাট পরিবর্তন
  const formattedDate = orderDate.split("/").join("-");
  const docId = `${dsrName}_${formattedDate}`;
  const historyRef = doc(db, "History", docId);

  // সবসময় ক্যাশ থেকে ডাটা নেওয়ার জন্য options
  const cacheOptions = { source: "cache" };

  let historySnap;
  try {
    historySnap = await getDoc(historyRef, cacheOptions);
  } catch (err) {
    console.error("ডকুমেন্ট লোড করতে সমস্যা:", err);
    // যদি offline থাকে বা কোনো সমস্যা হয়, তাহলে নতুন ডাটা হিসেবে গণ্য করুন
    historySnap = { exists: () => false };
  }

  let confirmUpdate = true;
  if (historySnap.exists && historySnap.exists()) {
    confirmUpdate = confirm("এই হিসাবটি ইতোমধ্যে বিদ্যমান! আপডেট করতে চান?");
    if (!confirmUpdate) return;
  }

  // স্ট্যাটাস ইউজারের পছন্দ অনুযায়ী সেট করুন
  let status = confirm("আপনি কি এই হিসাবটিকে **কমপ্লিট** হিসেবে সেট করতে চান?")
      ? "Complete"
      : "Incomplete";

  // UI থেকে টেবিলের ডাটা সংগ্রহ করা
  const tableData = {};
  document.querySelectorAll("#tabliContainer tbody").forEach((tbody) => {
    // প্রথম রো থেকে কোম্পানির নাম বের করা
    const companyName = tbody.querySelector("tr:first-child strong")?.textContent.trim();
    if (!companyName) {
      console.warn("⚠️ কোম্পানির নাম পাওয়া যায়নি, স্কিপ করা হচ্ছে...");
      return;
    }
    const formattedCompanyName = companyName.replace(/\s+/g, "_"); // Firestore নাম ফরম্যাটিং
    console.log("✅ কোম্পানির নাম:", formattedCompanyName);

    const rows = tbody.querySelectorAll("tr");
    const productArray = [];

    rows.forEach((row, index) => {
      // প্রথম রো (কোম্পানির নাম) বাদ দিয়ে
      if (index === 0 || row.querySelector("strong")) return;
      // যদি শেষ রো হয় (মোট হিসাব)
      if (index === rows.length - 1) {
        const lastRow = {
          rowName: "lastRow",
          totalSell: parseFloat(row.cells[0]?.querySelector("input")?.value) || 0,
          totalDamage: parseFloat(row.cells[1]?.querySelector("input")?.value) || 0,
          totalAmount: parseFloat(row.cells[2]?.querySelector("input")?.value) || 0,
        };
        productArray.push(lastRow);
        return;
      }
      // বাকি প্রতিটি প্রোডাক্টের তথ্য
      const productData = {
        productNumber: row.cells[0]?.textContent.trim() || "",
        productName: row.cells[1]?.textContent.trim() || "",
        order: parseFloat(row.cells[2]?.querySelector("input")?.value) || 0,
        returned: parseFloat(row.cells[3]?.querySelector("input")?.value) || 0,
        sell: parseFloat(row.cells[4]?.textContent) || 0,
        price: parseFloat(row.cells[5]?.textContent) || 0,
        totalSell: parseFloat(row.cells[6]?.textContent) || 0,
        stock: parseFloat(row.cells[7]?.textContent) || 0,
        damage: parseFloat(row.cells[8]?.querySelector("input")?.value) || 0,
        damageCost: parseFloat(row.cells[9]?.textContent) || 0,
      };
      productArray.push(productData);
    });
    tableData[formattedCompanyName] = productArray;
    console.log(`📌 ${formattedCompanyName} এর ডাটা সংরক্ষিত হচ্ছে...`);
  });

  // ইমিডিয়েট এলার্ট দেখাচ্ছে – ক্যাশে ডাটা সংরক্ষিত হয়েছে
  alert("🔥 ডাটা ক্যাশে সংরক্ষিত হয়েছে! (নেট অন হলে স্বয়ংক্রিয়ভাবে Firestore-এ Sync হবে)");

  // সবসময় setDoc() ব্যবহার করে ক্যাশে সেভ করা হবে; { merge: true } ব্যবহার করে পুরানো ডাটা সংরক্ষণ থাকবে
  try {
    await setDoc(historyRef, {
      roadName,
      dsrName,
      orderDate: formattedDate,
      totalSell,
      joma,
      dueAmount,
      status,
      notes,
      ...tableData,
    }, { merge: true });
    console.log("✅ Firestore-এ ডাটা Sync হওয়ার অপেক্ষায় (নেট অন হলে স্বয়ংক্রিয়ভাবে Sync হবে)!");
  } catch (error) {
    console.error("ডাটা সংরক্ষণ করতে সমস্যা:", error);
    alert("সমস্যা হয়েছে: " + error.message);
  }

  // পরবর্তীতে স্টক আপডেট ফাংশন কল করা হবে
  updateStockAndDamage();
};









async function fetchDSRNames() {
    try {
        const docRef = doc(db, "workerzone", "dsrall");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            console.log("ডকুমেন্টের ডাটা:", docData);

            // সব নাম সংগ্রহ করা
            const dsrList = Object.values(docData); 
            console.log("ডিএসআর তালিকা:", dsrList);

            // ড্রপডাউন মেনুতে নাম দেখানো
            const dropdownMenu = document.getElementById("dropdown-menu");
            dropdownMenu.innerHTML = ""; // আগের ডাটা মুছুন

            dsrList.forEach(name => {
                let div = document.createElement("div");
                div.textContent = name;
                div.style.padding = "5px";
                div.style.cursor = "pointer";
                div.onclick = () => selectDSR(name);
                dropdownMenu.appendChild(div);
            });

            dropdownMenu.style.display = "block"; // ড্রপডাউন দেখাও

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching DSR names:", error);
    }
}

// ইনপুট বক্সে ক্লিক করলে ড্রপডাউন দেখাবে
window.toggleDropdown = function () {
    let dropdown = document.getElementById("dropdown-menu");

    if (dropdown.style.display === "none") {
        dropdown.style.display = "block";
        fetchDSRNames(); // ফায়ারস্টোর থেকে নাম লোড করবে
    } else {
        dropdown.style.display = "none";
    }
}

// ড্রপডাউন থেকে নাম সিলেক্ট করলে ইনপুট বক্সে সেট হবে এবং মেনু লুকাবে
function selectDSR(name) {
    document.getElementById("dsr-name").value = name;
    document.getElementById("dropdown-menu").style.display = "none";
}



// ড্রাফ্ট পপআপ খুলুন
window.loadDrafts = async function () {
    const draftPopup = document.getElementById("draftPopup");
    const draftList = document.getElementById("draftList");
    draftList.innerHTML = ""; // আগের ডাটা মুছে ফেলবে

    const historyRef = collection(db, "History");
    const querySnapshot = await getDocs(historyRef);

    let hasDrafts = false;
    const uniqueDrafts = new Set(); // **🔹 ডুপ্লিকেট চেক করার জন্য `Set` ব্যবহার করা হচ্ছে**

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Incomplete") {
            const textContent = `${data.dsrName} - ${data.orderDate}`;

            if (!uniqueDrafts.has(textContent)) { // **🔹 যদি একই টেক্সট আগে থেকে না থাকে**
                uniqueDrafts.add(textContent); // **🔹 সেটে যোগ করা হচ্ছে**
                hasDrafts = true;

                const li = document.createElement("li");
                li.textContent = textContent;
                li.dataset.docId = doc.id;

                li.onclick = function () {
                    loadDraftData(doc.id);
                    draftPopup.style.display = "none"; // **🔹 ড্রাফ্ট পপআপ লুকানো হবে**
                };

                draftList.appendChild(li);
            }
        }
    });

    if (!hasDrafts) {
        alert("কোনো Incomplete হিসাব পাওয়া যায়নি!");
        return;
    }

    draftPopup.style.display = "block"; // **🔹 ড্রাফ্ট পপআপ দেখাবে**
};


async function loadDraftData(docId) {
    const historyRef = doc(db, "History", docId);
    let historySnap;
    try {
        // নেটওয়ার্ক অন থাকলে সরাসরি, নেটওয়ার্ক অফ থাকলে ক্যাশ থেকে ডাটা নেওয়ার চেষ্টা
        historySnap = await getDoc(historyRef, navigator.onLine ? {} : { source: "cache" });
    } catch (error) {
        console.error("ডকুমেন্ট লোড করতে সমস্যা:", error);
        alert("ডকুমেন্ট লোড করতে সমস্যা: " + error.message);
        return;
    }

    if (!historySnap.exists()) {
        alert("ডকুমেন্ট খুঁজে পাওয়া যায়নি!");
        return;
    }

    const data = historySnap.data();
    const table = document.getElementById("mainTable");

    // ✅ **নেভবারের ইনপুট ফিল্ডে ডাটা সেট করা হচ্ছে**
    document.getElementById("roadName").value = data.roadName || "";
    document.getElementById("dsr-name").value = data.dsrName || "";
    Object.assign(document.getElementById("orderDate"), { type: "text", value: data.orderDate || "" });
    document.getElementById("totalSell").value = data.totalSell || 0;
    document.getElementById("joma").value = data.joma || 0;
    document.getElementById("dueAmount").value = data.dueAmount || 0;
    document.getElementById("notes").value = data.notes || "";

    // **📌 Firestore-এ সরাসরি কোম্পানির নামগুলো লোড করা হচ্ছে**
    const companyNames = Object.keys(data).filter(key =>
        !["roadName", "dsrName", "orderDate", "totalSell", "joma", "dueAmount", "status", "notes"].includes(key)
    );

    console.log("📌 লোড হওয়া কোম্পানির নাম:", companyNames);

    // **📌 কোম্পানির নাম অনুযায়ী ডাটা লোড করা**
    for (const companyName of companyNames) {
        const products = data[companyName];

        if (!products || Object.keys(products).length === 0) {
            console.warn(`⚠️ ${companyName} এর কোনো প্রোডাক্ট ডাটা পাওয়া যায়নি!`);
            continue;
        }

        let tbody = document.getElementById(companyName);

        if (tbody) {
            alert(`${companyName} এর জন্য টেবিল ইতোমধ্যে রয়েছে!`);
            continue;
        }

        // ✅ **নতুন `tbody` তৈরি করা হবে**
        tbody = document.createElement("tbody");
        tbody.id = companyName;
        const companyNameFm = companyName.replace(/_/g, " "); // "_" -> " " পরিবর্তন
        // ✅ **প্রথম রো কোম্পানি নাম দেখাবে**
        const companyRow = document.createElement("tr");
        companyRow.innerHTML = `<td colspan="11"><strong>${companyNameFm}</strong></td>`;
        tbody.appendChild(companyRow);

        let lastRowData = null;

        console.log(`📌 ${companyNameFm} এর প্রোডাক্ট লোড হচ্ছে...`);

        // ✅ **প্রত্যেকটি প্রোডাক্টের জন্য রো তৈরি হবে**
        Object.keys(products).forEach((productNumber) => {
            const productData = products[productNumber];

            if (productData.rowName === "lastRow") {
                lastRowData = productData;
                return;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${productData.productNumber || productNumber}</td>
                <td>${productData.productName || "N/A"}</td>
                <td><input type="text" placeholder="অর্ডার" value="${productData.order || ""}"></td>
                <td><input type="text" placeholder="ফেরত" value="${productData.returned || ""}"></td>
                <td>${productData.sell || ""}</td>
                <td>${productData.price || ""}</td>
                <td>${productData.totalSell || ""}</td>
                <td>${productData.stock || ""}</td>
                <td><input type="text" placeholder="ডেমেজ" value="${productData.damage || ""}"></td>
                <td>${productData.damageCost || ""}</td>
                <td>
                    <button class="option-btn delete-btn" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button>
                    <button class="option-btn edit-btn" onclick="editRow(this)"><i class="fas fa-edit"></i></button>
                    <button class="option-btn equal-btn" onclick="equalFunction(this)"><i class="fas fa-equals"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log(`✅ ${companyName} এর প্রোডাক্ট লোড সম্পন্ন ✅`);

        // ✅ **মোট হিসাবের জন্য লাস্ট রো যোগ করা হচ্ছে**
        if (lastRowData) {
            const totalRow = document.createElement("tr");
            totalRow.innerHTML = `
                <td colspan="2">
                    <div class="placeholder-container">
                        <label>মোট বিক্রি</label>
                        <input type="text" id="totalSellInput" placeholder=" " value="${lastRowData.totalSell || ""}">
                    </div>
                </td>
                <td colspan="2">
                    <div class="placeholder-container">
                        <label>মোট ডেমেজ</label>
                        <input type="text" id="totalDamageInput" placeholder=" " value="${lastRowData.totalDamage || ""}">
                    </div>
                </td>
                <td colspan="2" id="motTaka">
                    <div class="placeholder-container">
                        <label>মোট টাকা</label>
                        <input type="text" id="totalAmountInput" placeholder=" " value="${lastRowData.totalAmount || ""}">
                    </div>
                </td>
                <td>
                    <button class="eql" onclick="equalFunction(this)"><i class="fas fa-equals"></i></button>
                </td>
            `;
            tbody.appendChild(totalRow);
        }

        // ✅ **টেবিলে `tbody` যোগ করা হচ্ছে**
        table.appendChild(tbody);
    }

    alert("✅ ডাটা সফলভাবে লোড হয়েছে!");
}



// পপআপ বন্ধ করুন
window.closeDraftPopup = function () {
    document.getElementById("draftPopup").style.display = "none";
}


window.updateStockAndDamage = async function () {
  const table = document.getElementById("mainTable"); // টেবিল নির্বাচন
  const tbodies = table.querySelectorAll("tbody"); // সব tbody সংগ্রহ

  // প্রতিটি কোম্পানির জন্য লুপ
  for (const tbody of tbodies) {
    // প্রথম রো থেকে কোম্পানির নাম সংগ্রহ (strong ট্যাগের ভিতর)
    const companyName = tbody.querySelector("tr:first-child strong")?.textContent.trim();
    if (!companyName) continue;

    // Firestore ডকুমেন্টের ID হিসেবে কোম্পানির নাম (স্পেস বদলে _)
    const formattedCompanyName = companyName.replace(/\s+/g, "_");
    const companyRef = doc(db, "companyAll", formattedCompanyName);

    // নেটওয়ার্ক অন থাকলে সরাসরি, অফলাইনে থাকলে ক্যাশ থেকে ডাটা নেওয়া হবে
    let companySnap;
    try {
      companySnap = await getDoc(companyRef, navigator.onLine ? {} : { source: "cache" });
    } catch (e) {
      console.error("ডকুমেন্ট লোড করতে সমস্যা:", e);
      continue;
    }
    if (!companySnap.exists()) {
      console.warn(`⚠️ ${companyName} (${formattedCompanyName}) এর ডকুমেন্ট পাওয়া যায়নি!`);
      continue;
    }

    const companyData = companySnap.data(); // ডকুমেন্টের ডাটা

    // tbody-তে থাকা প্রতিটি প্রোডাক্টের row নিয়ে লুপ
    const rows = tbody.querySelectorAll("tr:not(:first-child)");
    for (const row of rows) {
      const cells = row.cells;
      if (cells.length < 10) continue; // যথেষ্ট কলাম না থাকলে স্কিপ

      const productNumber = cells[0]?.textContent.trim(); // প্রোডাক্ট নাম্বার
      const sellValue = parseFloat(cells[4]?.textContent) || 0; // বিক্রির সংখ্যা
      const damageValue = parseFloat(cells[8]?.querySelector("input")?.value) || 0; // ডেমেজের সংখ্যা

      // UI (টেবিল) থেকে স্টক মান, ধরে নিচ্ছি ৭ নং সেলে স্টক আছে
      const stockFromTable = parseFloat(cells[7]?.textContent) || 0;

      if (!productNumber || !(productNumber in companyData)) {
        console.warn(`⚠️ ${productNumber} (${companyName}) প্রোডাক্ট পাওয়া যায়নি!`);
        continue;
      }

      const productData = companyData[productNumber];
      // Firestore ডক থেকে স্টক মান
      const stockFromDoc = parseFloat(productData.stockQuantity) || 0;

      // চেক: যদি টেবিলের স্টক এবং ডকুমেন্টের স্টক মান একই হয়, তবেই আপডেট করুন
      if (stockFromTable !== stockFromDoc) {
        console.warn(
          `⚠️ ${companyName} এর ${productNumber} এর স্টক মান মিলছে না (ডক: ${stockFromDoc}, টেবিল: ${stockFromTable}). আপডেট করা হবে না।`
        );
        continue;
      }

      // নতুন স্টক গণনা: বর্তমান ডক স্টক থেকে বিক্রির সংখ্যা মাইনাস
      const calculatedStock = stockFromDoc - sellValue;
      // নতুন ডেমেজ: ডক এর ডেমেজ মান থেকে নতুন ডেমেজ যোগ করা
      const updatedDamage = (parseFloat(productData.damage) || 0) + damageValue;

      try {
        await updateDoc(companyRef, {
          [`${productNumber}.stockQuantity`]: calculatedStock,
          [`${productNumber}.damage`]: updatedDamage
        });
        console.log(
          `✅ ${companyName} এর ${productNumber} আপডেট হয়েছে! (নতুন স্টক: ${calculatedStock}, নতুন ডেমেজ: ${updatedDamage})`
        );
      } catch (error) {
        console.error(`❌ ${companyName} এর ${productNumber} আপডেটে সমস্যা:`, error);
      }
    }
  }
  alert("🔥 স্টক ও ডেমেজ সফলভাবে আপডেট হয়েছে!");
};


