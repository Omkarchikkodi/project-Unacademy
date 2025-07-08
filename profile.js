import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const allowedEmails = ["omkarchikkodi26@gmail.com", "rahulpattadi@gmail.com"];

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        showPopup("User not logged in");
        window.location.href = 'login.html';
        return;
    }

    // ✅ Show uploader link only to admin
    if (allowedEmails.includes(user.email)) {
      const quizUploaderLink = document.getElementById("quizUploaderLink");
      if (quizUploaderLink) {
        quizUploaderLink.style.display = "list-item";
      }
    }
    // Static user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('displayName').textContent = user.name;
    document.getElementById('displayEmail').textContent = user.email;

    // Form fields
    const classSelect = document.getElementById('classSelect');
    const cityInput = document.getElementById('city');
    const phoneInput = document.getElementById('phone');
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');
    const pincodeInput = document.getElementById('pincode');

    // District options by state
    const districtsByState = {
        AndhraPradesh: [
            "Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa (YSR)", "Krishna",
            "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam",
            "Vizianagaram", "West Godavari"
        ],
        ArunachalPradesh: [
            "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle",
            "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley",
            "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare",
            "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
        ],
        Assam: [
            "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang",
            "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai",
            "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur",
            "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
            "Tinsukia", "Udalguri", "West Karbi Anglong"
        ],
        Bihar: [
            "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga",
            "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar",
            "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger (Monghyr)", "Muzaffarpur",
            "Nalanda", "Nawada", "Patna", "Purnia (Purnea)", "Rohtas", "Saharsa", "Samastipur", "Saran",
            "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
        ],
        Chhattisgarh: [
            "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur",
            "Dantewada (Dakshin Bastar)", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa",
            "Jashpur", "Kabirdham (Kawardha)", "Kanker", "Kondagaon", "Korba", "Koriya (Korea)", "Mahasamund",
            "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"
        ],
        Goa: [
            "North Goa", "South Goa"
        ],
        Gujarat: [
            "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad",
            "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar",
            "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari",
            "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar",
            "Tapi", "Vadodara", "Valsad"
        ],
        Haryana: [
            "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar",
            "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat (Nuh)",
            "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
        ],
        HimachalPradesh: [
            "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti",
            "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
        ],
        Jharkhand: [
            "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
            "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma",
            "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj",
            "Seraikela Kharsawan", "Simdega", "West Singhbhum"
        ],
        Karnataka: [
            "Bagalkote", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", "Bengaluru Urban", "Bidar",
            "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere",
            "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu (Coorg)", "Kolar", "Koppal",
            "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
            "Vijayapura (Bijapur)", "Vijayanagara", "Yadgir"
        ],
        Kerala: [
            "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
            "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
        ],
        MadhyaPradesh: [
            "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind",
            "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori",
            "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa",
            "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh",
            "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri",
            "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
        ],
        Maharashtra: [
            "Mumbai City", "Mumbai Suburban", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg", "Thane", "Kolhapur",
            "Pune", "Sangli", "Satara", "Solapur", "Ahmednagar", "Dhule", "Jalgaon", "Nandurbar", "Nashik",
            "Chhatrapati Sambhajinagar (Aurangabad)", "Beed", "Hingoli", "Jalna", "Latur", "Nanded", "Dharashiv (Osmanabad)",
            "Parbhani", "Akola", "Amravati", "Buldhana", "Washim", "Yavatmal", "Bhandara", "Chandrapur", "Gadchiroli",
            "Gondia", "Nagpur", "Wardha"
        ],
        Manipur: [
            "Bishnupur", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching",
            "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
        ],
        Meghalaya: [
            "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills",
            "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills",
            "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
        ],
        Mizoram: [
            "Aizawl", "Champhai", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saitual", "Serchhip", "Hnahthial"
        ],
        Nagaland: [
            "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"
        ],
        Odisha: [
            "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh",
            "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi",
            "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri",
            "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur",
            "Sonepur", "Sundargarh"
        ],
        Punjab: [
            "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur",
            "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga",
            "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)",
            "Sangrur", "Tarn Taran"
        ],
        Rajasthan: [
            "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner",
            "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh",
            "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli",
            "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar",
            "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
        ],
        Sikkim: [
            "East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"
        ],
        TamilNadu: [
            "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
            "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri",
            "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
            "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
            "Thanjavur", "The Nilgiris", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli",
            "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
            "Vellore", "Viluppuram", "Virudhunagar"
        ],
        Telangana: [
            "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally",
            "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad",
            "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda",
            "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy",
            "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)",
            "Yadadri Bhuvanagiri"
        ],
        Tripura: [
            "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"
        ],
        UttarPradesh: [
            "Agra", "Aligarh", "Ambedkar Nagar", "Amethi (Chatrapati Sahuji Mahraj Nagar)", "Amroha", "Auraiya",
            "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki",
            "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot",
            "Deoria", "Etah", "Etawah", "Ayodhya (Faizabad)", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar",
            "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun",
            "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar",
            "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura",
            "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh",
            "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli",
            "Shravasti", "Siddharth Nagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
        ],
        Uttarakhand: [
            "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital",
            "Pauri Garhwal", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
        ],
        WestBengal: [
            "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling",
            "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda",
            "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
            "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
        ]

    };

    // Handle state change → populate districts
    stateSelect.addEventListener("change", () => {
        const selectedState = stateSelect.value;
        const districts = districtsByState[selectedState] || [];

        districtSelect.innerHTML = `<option value="">Select District</option>`;
        districts.forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    });

    // // Pre-fill user form data
    // classSelect.value = user.class || '';
    // cityInput.value = user.city || '';
    // phoneInput.value = user.phone || '';
    // stateSelect.value = user.state || '';

    // // 🔄 Trigger the state change so districts populate
    // stateSelect.dispatchEvent(new Event('change'));

    // districtSelect.value = user.district || '';
    // pincodeInput.value = user.pincode || '';

    // 🔥 Load form values from Firestore (not from localStorage!)
    onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("✅ onAuthStateChanged triggered");
        if (firebaseUser) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
                console.log("user found");
                const data = userDoc.data();
                classSelect.value = data.class || '';
                cityInput.value = data.city || '';
                phoneInput.value = data.phone || '';
                stateSelect.value = data.state || '';

                // 🔄 Populate districts based on state before setting district
                stateSelect.dispatchEvent(new Event('change'));

                districtSelect.value = data.district || '';
                pincodeInput.value = data.pincode || '';
            } else {
                console.warn("⚠️ No user profile found in Firestore");
            }
        } else {
            console.warn("⚠️ User not authenticated");
        }
    });
});

window.saveProfile = saveProfile;
window.logout = logout;

async function saveProfile() {
    console.log('Save profile');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    user.class = document.getElementById('classSelect').value;
    user.city = document.getElementById('city').value;
    user.phone = document.getElementById('phone').value;
    user.state = document.getElementById('state').value;
    user.district = document.getElementById('district').value;
    user.pincode = document.getElementById('pincode').value;

    if (!/^\d{6}$/.test(user.pincode)) {
        showPopup("Pincode must be exactly 6 digits.");
        return;
    }

    // --- Time Management for createdAt and lastModifiedAt ---
    const currentTime = new Date(); // Current time in local timezone of the client

    // Format for display/storage if needed (IST)
    const options = {
        timeZone: 'Asia/Kolkata', // IST timezone
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Use 24-hour format
    };
    const istDateTime = currentTime.toLocaleString('en-IN', options);
    console.log(istDateTime);
    user.lastModifiedAt = currentTime;
    // if (!user.createdAt) {
    //     console.log("dont have created at");
    //     user.createdAt = currentTime;
    // }

    localStorage.setItem('loggedInUser', JSON.stringify(user));

    // 🔥 Upload to Firestore
    try {
        const { setDoc, doc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");


        // Ensure user is authenticated
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const uid = firebaseUser.uid;
                const userDocRef = doc(db, "users", uid);
                const dataToUpdate = {
                    class: user.class,
                    city: user.city,
                    phone: user.phone,
                    state: user.state,
                    district: user.district,
                    pincode: user.pincode,
                    lastModifiedAt: serverTimestamp(), // Always update with server time
                    // createdAt:user.createdAt
                };

                // Only set createdAt if it doesn't exist in the database yet
                // This requires fetching the document first to check.
                const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                const docSnap = await getDoc(userDocRef);

                // if (!docSnap.exists() || !docSnap.data().createdAt) {
                //     dataToUpdate.createdAt = serverTimestamp(); // Set createdAt only once for new users
                // }

                await setDoc(userDocRef, user, { merge: true });
                console.log("✅ Profile data synced to Firestore");
            } else {
                console.warn("⚠️ No authenticated Firebase user found.");
            }
        });
    } catch (error) {
        console.error("❌ Error uploading to Firestore:", error);
    }

    // Show popup
    document.getElementById("popupOverlay").classList.add("show");

    // Redirect after 5 seconds
    setTimeout(() => {
        window.location.href = "home.html";
    }, 5000);
}



// function logout() {
//     localStorage.removeItem('loggedInUser');
//     window.location.href = 'home.html';
// }

function logout() {
  signOut(auth).then(() => {
    // 🔥 Clear localStorage
    localStorage.removeItem("loggedInUser");

    // ✅ Optionally clear the entire local storage
    // localStorage.clear();

    // Redirect to home/login
    window.location.href = "home.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
}

let popupTimeout;

function showPopup(message, duration = 3000) {
    const popup = document.getElementById("customPopup");
    const msgBox = document.getElementById("popupMessage");

    if (popup && msgBox) {
        // Clear existing timeout
        if (popupTimeout) {
            clearTimeout(popupTimeout);
        }

        msgBox.textContent = message;
        popup.classList.add("show");
        popup.classList.remove("hidden");

        // Hide after duration
        popupTimeout = setTimeout(() => {
            popup.classList.remove("show");
            popup.classList.add("hidden");
        }, duration);
    }
}