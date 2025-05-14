        /*/ Import Firebase modules
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
  import {
    getFirestore, 
    collection, 
    onSnapshot,
    setDoc,
    getDoc,
    doc,
    deleteDoc,
    updateDoc,
    arrayUnion
  } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyACFf60qa7Udvz9Xn8GN6vu9V_BkQzdovk",
    authDomain: "shakib-enterprise-6df83.firebaseapp.com",
    projectId: "shakib-enterprise-6df83",
    storageBucket: "shakib-enterprise-6df83.appspot.com",
    messagingSenderId: "957943781117",
    appId: "1:957943781117:web:af41a45c8a202fdb52d094"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);


window.showAddCustomerPopup = function () {
    document.getElementById("addCustomerPopup").style.display = "block";
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

window.addCustomer = function () {
    const name = document.getElementById("customerName").value.trim();
    const number = document.getElementById("customerNumber").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const identity = document.getElementById("customerIdentity").value.trim();

    if (name && number && address && identity) {
        const customerData = {
            name: name,
            number: number,
            address: address,
            identity: identity,
            transactions: [],
            createdAt: new Date().toISOString()
        };

        setDoc(doc(db, "bakihisab", name), customerData)
            .then(() => {
                alert("কাস্টমার সেভ করা হয়েছে!");
                 // কাস্টমার লিস্ট রিফ্রেশ
                closePopup("addCustomerPopup"); // পপআপ বন্ধ
            })
            .catch((error) => {
                console.error("এরর:", error);
                alert("ডেটা সেভ করতে সমস্যা হয়েছে।");
            });
    } else {
        alert("সব তথ্য পূরণ করুন।");
    }
}


function renderCustomerList() {
    const list = document.getElementById("customerList");
    list.innerHTML = ""; // লিস্ট ক্লিয়ার

    // রিয়েল-টাইম লিসেনার সেটআপ
    onSnapshot(collection(db, "bakihisab"), (snapshot) => {
        list.innerHTML = ""; // প্রতিবার আপডেটের আগে লিস্ট ক্লিয়ার করুন

        snapshot.forEach((doc) => {
            const customer = doc.data();
            const customerId = doc.id;

            const card = document.createElement("div");
            card.className = "customer-card";
            card.innerHTML = `
                <span class="cst-name">${customer.name}</span>
                <button class="delete-btn" onclick="deleteRow('${customerId}')"><i class="fas fa-trash"></i></button>
                <button class="edit-btn" onclick="editRow('${customerId}')"><i class="fas fa-edit"></i></button>
                <span class="remaining-balance">মোট বাকি: লোড হচ্ছে...</span> 
            `;

            // কাস্টমারের নামের উপর ক্লিক ইভেন্ট
            const nameElement = card.querySelector(".cst-name");
            nameElement.onclick = () => showCustomerDetails(customerId);

            // মোট অবশিষ্ট বাকি আপডেট করা
            updateRemainingBalance(customerId, card.querySelector(".remaining-balance"));

            list.appendChild(card);
        });
    });
}

// **মোট অবশিষ্ট বাকি আপডেট করার ফাংশন**
function updateRemainingBalance(customerId, balanceElement) {
    const docRef = doc(db, "bakihisab", customerId);

    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const customer = docSnap.data();
            const transactions = Array.isArray(customer.transactions) ? customer.transactions : [];

            // মোট Due এবং Deposit হিসাব করা
            const totalDue = transactions.reduce((sum, t) => sum + (t.type === "due" ? t.amount : 0), 0);
            const totalPaid = transactions.reduce((sum, t) => sum + (t.type === "deposit" ? t.amount : 0), 0);

            // অবশিষ্ট মূল্য গণনা
            const remainingBalance = totalDue - totalPaid;

            // স্প্যানে আপডেট করা
            balanceElement.textContent = `মোট বাকি: ${remainingBalance} টাকা`;

            console.log(`Updated balance for ${customerId}: ${remainingBalance}`);
        } else {
            balanceElement.textContent = "মোট বাকি: তথ্য নেই";
        }
    }, (error) => {
        console.error("Error updating remaining balance:", error);
        balanceElement.textContent = "মোট বাকি: লোড করতে সমস্যা!";
    });
}


// মোট বাকি দেখানোর জন্য 
 function updateTotalRemainingBalance() {
    const totalBalanceSpan = document.getElementById("totalRemainingBalance"); // যেখানে মোট অবশিষ্ট টাকা দেখানো হবে

    onSnapshot(collection(db, "bakihisab"), (snapshot) => {
        let totalRemaining = 0; // সব কাস্টমারের অবশিষ্ট টাকা যোগ করার জন্য ভেরিয়েবল

        snapshot.forEach((doc) => {
            const customer = doc.data();
            const transactions = Array.isArray(customer.transactions) ? customer.transactions : [];

            // মোট Due এবং Deposit হিসাব করা
            const totalDue = transactions.reduce((sum, t) => sum + (t.type === "due" ? t.amount : 0), 0);
            const totalPaid = transactions.reduce((sum, t) => sum + (t.type === "deposit" ? t.amount : 0), 0);

            // এই কাস্টমারের অবশিষ্ট টাকা
            const remainingBalance = totalDue - totalPaid;

            // সব কাস্টমারের জন্য যোগ করা
            totalRemaining += remainingBalance;
        });

        // স্প্যানে আপডেট করা
        totalBalanceSpan.textContent = `সর্বমোট বাকি: ${totalRemaining} টাকা`;

        console.log(`Total remaining balance updated: ${totalRemaining}`);
    }, (error) => {
        console.error("Error updating total remaining balance:", error);
        totalBalanceSpan.textContent = "সর্বমোট অবশিষ্ট: লোড করতে সমস্যা!";
    });
}

renderCustomerList();
window.onload = function () {
    updateTotalRemainingBalance(); // মোট অবশিষ্ট আপডেট শুরু হবে
};


// ডিলিট বাটনের কাজ
window.deleteRow = function () {
    if (confirm("আপনি কি নিশ্চিত যে এই কাস্টমারকে ডিলিট করতে চান?")) {
        // Firestore থেকে ডকুমেন্ট ডিলিট করা
        deleteDoc(doc(db, "bakihisab", customerId))
            .then(() => {
                alert("কাস্টমার সফলভাবে ডিলিট করা হয়েছে!");
                renderCustomerList(); // ডিলিটের পর লিস্ট আপডেট
            })
            .catch((error) => {
                console.error("ডিলিট করতে সমস্যা:", error);
                alert("ডিলিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            });
    } else {
        alert("ডিলিট বাতিল করা হয়েছে।"); // ডিলিট ক্যানসেল করলে
    }
}

window.editRow = async function () {
    try {
        const docRef = doc(db, "bakihisab", customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const customer = docSnap.data();

            // ফর্মে ডেটা প্রি-ফিল করা
            document.getElementById("customerName").value = customer.name;
            document.getElementById("customerNumber").value = customer.number;
            document.getElementById("customerAddress").value = customer.address;
            document.getElementById("customerIdentity").value = customer.identity;

            // পপআপ দেখানো
            document.getElementById("addCustomerPopup").style.display = "block";

            // সাবমিট বাটনের জন্য ইভেন্ট হ্যান্ডলার
            const saveButton = document.getElementById("saveCustomerButton");
            saveButton.onclick = async function () {
                const updatedName = document.getElementById("customerName").value.trim();
                const updatedNumber = document.getElementById("customerNumber").value.trim();
                const updatedAddress = document.getElementById("customerAddress").value.trim();
                const updatedIdentity = document.getElementById("customerIdentity").value.trim();

                if (updatedName && updatedNumber && updatedAddress && updatedIdentity) {
                    try {
                        await updateDoc(docRef, {
                            name: updatedName,
                            number: updatedNumber,
                            address: updatedAddress,
                            identity: updatedIdentity
                        });
                        alert("কাস্টমার তথ্য আপডেট হয়েছে!");
                        document.getElementById("addCustomerPopup").style.display = "none";
                    } catch (error) {
                        console.error("আপডেট করতে সমস্যা:", error);
                        alert("আপডেট করতে সমস্যা হয়েছে।");
                    }
                } else {
                    alert("সব তথ্য পূরণ করুন।");
                }
            };
        } else {
            alert("কাস্টমার পাওয়া যায়নি!");
        }
    } catch (error) {
        console.error("ডেটা লোড করতে সমস্যা:", error);
        alert("ডেটা লোড করতে সমস্যা হয়েছে।");
    }
}

window.showCustomerDetails = async function (customerId) {
    try {
       
        const docRef = doc(db, "bakihisab", customerId);
        const docSnap = await getDoc(docRef);
       

        if (docSnap.exists()) {
            const customer = docSnap.data();

            // পপআপে কাস্টমারের নাম
            document.getElementById("customerDetailName").textContent = customer.name;

            // কাস্টমারের অন্যান্য তথ্য
            document.getElementById("customerDetailNumber").textContent = `নাম্বার: ${customer.number}`;
            document.getElementById("customerDetailAddress").textContent = `ঠিকানা: ${customer.address}`;
            document.getElementById("customerDetailIdentity").textContent = `পরিচয়: ${customer.identity}`;

           //  লেনদেন এবং তথ্য আপডেট
          listenToTransactionSummary(customerId); // নতুন লাইভ আপডেট ফাংশন

          listenToTransactions(customerId);

            // পপআপ দেখানো
            document.getElementById("customerDetailPopup").style.display = "block";
        } else {
            alert("কাস্টমার পাওয়া যায়নি!");
        }
    } catch (error) {
        console.error("ডেটা লোড করতে সমস্যা:", error);
        alert("ডেটা লোড করতে সমস্যা হয়েছে।");
    }
}


window.showTransactionPopup = function (type) {
    const popup = document.getElementById("transactionPopup");
    if (popup) {
        document.getElementById("transactionPopupTitle").textContent = type === "deposit" ? "জমা যোগ করুন" : "বাকি যোগ করুন";
        popup.dataset.type = type;
        popup.style.display = "block";
    } else {
        console.error("পপআপ এলিমেন্ট পাওয়া যায়নি!");
    }
}


function listenToTransactionSummary(customerId) {
    if (!customerId) {
        console.error("Error: customerId is missing!");
        return;
    }

    const db = getFirestore();
    const docRef = doc(db, "bakihisab", customerId);

    // Firestore লাইভ লিসেনার সেট করা
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const customer = docSnap.data();
            console.log("Live update - Customer data:", customer);

            const transactions = Array.isArray(customer.transactions) ? customer.transactions : [];

            // মোট due এবং deposit হিসাব করা
            const totalDue = transactions.reduce((sum, t) => sum + (t.type === "due" ? t.amount : 0), 0);
            const totalPaid = transactions.reduce((sum, t) => sum + (t.type === "deposit" ? t.amount : 0), 0);

            console.log("Total Due:", totalDue, "Total Paid:", totalPaid);

            // UI তে আপডেট করা
            document.getElementById("totalDue").textContent = totalDue;
            document.getElementById("totalPaid").textContent = totalPaid;
            document.getElementById("remainingDue").textContent = totalDue - totalPaid;
        } else {
            console.warn("Customer document not found!");
        }
    });
}


function listenToTransactions(customerId) {
    if (!customerId) {
        console.error("Error: customerId is missing!");
        return;
    }

    const db = getFirestore();
    const docRef = doc(db, "bakihisab", customerId);

    // Firestore এর লাইভ লিসেনার
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const customer = docSnap.data();
            const transactions = Array.isArray(customer.transactions) ? customer.transactions : [];
            
            console.log("Live update - Transactions:", transactions);

            // লিস্ট আপডেট করা
            updateTransactionList(transactions);
        } else {
            console.warn("Customer document not found!");
        }
    });
}

// ট্রানজেকশন লিস্ট আপডেট করার ফাংশন
function updateTransactionList(transactions) {
    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    if (transactions.length > 0) {
        transactions.forEach(t => {
            const item = document.createElement("div");
            item.textContent = t.date && t.amount && t.reason 
                ? `${t.date}: ${t.amount} টাকা (${t.reason})` 
                : "অসম্পূর্ণ ট্রানজ্যাকশন তথ্য";
            list.appendChild(item);
        });
    } else {
        list.innerHTML = "<p>কোনো ট্রানজ্যাকশন নেই</p>";
    }
}




window.addTransaction = async function (customerId) {
    try {
        if (!customerId) {
            console.warn("Warning: customerId is undefined. Fetching from UI...");
            customerId = document.getElementById("customerDetailName").textContent;
        }

        const db = getFirestore();
        const docRef = doc(db, "bakihisab", customerId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error("Error: Customer document not found!");
            alert("এই কাস্টমার Firestore-এ নেই!");
            return;
        }

        console.log("Customer data found:", docSnap.data());

        // ইনপুট থেকে নতুন ট্রানজেকশন নেওয়া
        const type = document.getElementById("transactionPopup").dataset.type;
        const date = document.getElementById("transactionDate").value;
        const amount = parseFloat(document.getElementById("transactionAmount").value);
        const reason = document.getElementById("transactionReason").value;

        const newTransaction = { type, date, amount, reason };

        // `transactions` ফিল্ড আপডেট করা
        const customer = docSnap.data();
        if (!Array.isArray(customer.transactions)) {
            await updateDoc(docRef, { transactions: [newTransaction] });
        } else {
            await updateDoc(docRef, { transactions: arrayUnion(newTransaction) });
        }

        console.log("Transaction added successfully!");
        alert("ট্রানজ্যাকশন সফলভাবে যুক্ত হয়েছে।");

        // **লাইভ আপডেট চালু করা**
        listenToTransactions(customerId);

        closePopup("transactionPopup");

    } catch (error) {
        console.error("ট্রানজ্যাকশন অ্যাড করতে সমস্যা:", error);
        alert("ট্রানজ্যাকশন অ্যাড করতে সমস্যা হয়েছে।");
    }
};
// কাস্টমার ডিটেইল এন্ড ট্রানজ্যাকশন পপাপ ক্লোস
window.closePopupAll = function (button) {
    const popup = button.closest(".popup"); // যে পপআপের ভেতর বাটন আছে সেটি খুঁজুন
    if (popup) {
        popup.style.display = "none"; // শুধু সেই পপআপ বন্ধ করুন
        console.log(`Popup ${popup.id} closed.`);
    } else {
        console.warn("No parent popup found for the clicked button!");
    }
}


  // Fetch product list on page load
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user.uid);
      fetchProductList();
    } else {
      console.error("User not logged in. Redirecting to login page.");
      window.location.href = "login.html"; // Redirect to login page
    }
  }); */
  
  
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");
    const toggleSidebarBtn = document.getElementById("toggleSidebar");
    const addCustomerBtn = document.getElementById("addCustomerBtn");
    const customerList = document.getElementById("customerList");
    const customerProfile = document.getElementById("customerProfile");
    const showTransactionForm = document.getElementById("showTransactionForm");
    const transactionForm = document.getElementById("transactionForm");
    const saveTransaction = document.getElementById("saveTransaction");

    if (!toggleSidebarBtn || !addCustomerBtn || !customerList || !customerProfile || !showTransactionForm || !transactionForm || !saveTransaction) {
        console.error("একটি বা একাধিক প্রয়োজনীয় এলিমেন্ট পাওয়া যায়নি!");
        return;
    }

    toggleSidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
    });

    addCustomerBtn.addEventListener("click", () => {
        const name = prompt("কাস্টমারের নাম:");
        if (name) {
            let customer = { id: Date.now(), name, transactions: [] };
            customers.push(customer);
            updateCustomerList();
        }
    });

    function updateCustomerList() {
        if (!customerList) {
            console.error("Error: customerList এলিমেন্ট পাওয়া যায়নি!");
            return;
        }
        customerList.innerHTML = "";
        customers.forEach(customer => {
            let li = document.createElement("li");
            li.innerText = customer.name;
            li.addEventListener("click", () => {
                showCustomerProfile(customer);
                sidebar.classList.add("hidden");
            });
            customerList.appendChild(li);
        });
    }

    if (showTransactionForm) {
        showTransactionForm.addEventListener("click", () => {
            transactionForm.style.display = transactionForm.style.display === "block" ? "none" : "block";
        });
    } else {
        console.error("Error: showTransactionForm পাওয়া যায়নি!");
    }

    if (saveTransaction) {
        saveTransaction.addEventListener("click", () => {
            let amount = document.getElementById("amount").value;
            let date = document.getElementById("date").value;
            let reason = document.getElementById("reason").value;
            if (amount && date && selectedCustomer) {
                selectedCustomer.transactions.push({ amount, date, reason });
                updateTransactionList(selectedCustomer);
                transactionForm.style.display = "none";
            }
        });
    }
});

