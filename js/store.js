/* State Management & LocalStorage Adapter */

const DEFAULT_STATE = {
  users: [
    {
      id: "u_admin",
      name: "Sophia Carter",
      email: "admin@charityconnect.org",
      password: "admin", // simple credentials for demonstration
      role: "admin",
      phone: "+1 (555) 019-2834",
      location: "San Francisco, CA"
    },
    {
      id: "u_donor",
      name: "Alex Johnson",
      email: "donor@example.com",
      password: "donor",
      role: "donor",
      phone: "+1 (555) 012-3456",
      location: "New York, NY",
      paymentMethods: [
        { id: "pm_1", type: "card", cardNum: "**** **** **** 4242", name: "Alex Johnson", expiry: "12/28" }
      ]
    }
  ],
  campaigns: [
    {
      id: "camp_clean_water",
      title: "Clean Water Initiative",
      description: "Providing sustainable clean water systems and filtration units to remote rural communities suffering from drought and waterborne diseases.",
      category: "Environment",
      goal: 50000,
      raised: 37500,
      image: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "camp_education",
      title: "Bright Minds Scholarship",
      description: "Sponsoring school supplies, uniforms, digital tablets, and tuition fees for underprivileged children in developing urban clusters.",
      category: "Education",
      goal: 30000,
      raised: 18200,
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "camp_zero_hunger",
      title: "Zero Hunger Project",
      description: "Supporting community kitchens, food pantries, and fresh-produce drives to guarantee daily nutritious meals for families affected by inflation.",
      category: "Humanitarian",
      goal: 40000,
      raised: 39100,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "camp_disaster_relief",
      title: "Emergency Disaster Response",
      description: "Deploying basic medical aid, emergency housing packets, blankets, and canned meals to regions recently affected by severe flooding.",
      category: "Humanitarian",
      goal: 80000,
      raised: 12000,
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      active: true
    }
  ],
  events: [
    {
      id: "ev_tree_planting",
      title: "Global Canopy Tree Planting Drive",
      description: "Join us in planting over 1,000 native saplings in urban parks to restore local biodiversity and reduce local temperatures.",
      date: "2026-08-15",
      time: "09:00 AM - 01:00 PM",
      location: "Golden Gate Park, San Francisco",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
      registrations: ["donor@example.com"]
    },
    {
      id: "ev_gala",
      title: "Hope & Harmony Annual Gala",
      description: "An elegant evening of fundraising, live jazz, classical recitals, and impact report sharing to support our primary programs.",
      date: "2026-09-10",
      time: "06:30 PM - 10:00 PM",
      location: "Metropolitan Ballroom, NY",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
      registrations: []
    },
    {
      id: "ev_soup_kitchen",
      title: "Weekend Community Meal Prep",
      description: "Help slice veggies, pack food containers, and distribute meals to residents at the local downtown community shelter.",
      date: "2026-07-25",
      time: "08:00 AM - 12:00 PM",
      location: "Downtown Family Shelter, SF",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80",
      registrations: []
    }
  ],
  volunteers: [
    {
      id: "vol_1",
      name: "Marcus Aurelius",
      email: "marcus@rome.net",
      phone: "123-456-7890",
      skills: "Coordination, Public Speaking",
      interest: "Zero Hunger Project",
      status: "approved",
      date: "2026-06-12"
    },
    {
      id: "vol_2",
      name: "Jane Smith",
      email: "janesmith@gmail.com",
      phone: "555-987-6543",
      skills: "Logistics, First Aid",
      interest: "Emergency Disaster Response",
      status: "pending",
      date: "2026-07-08"
    }
  ],
  donations: [
    {
      id: "tx_1001",
      email: "donor@example.com",
      name: "Alex Johnson",
      amount: 150,
      type: "one-time",
      campaignId: "camp_clean_water",
      campaignTitle: "Clean Water Initiative",
      paymentMethod: "Credit Card (4242)",
      date: "2026-06-15T10:30:00Z"
    },
    {
      id: "tx_1002",
      email: "donor@example.com",
      name: "Alex Johnson",
      amount: 50,
      type: "recurring",
      campaignId: "camp_education",
      campaignTitle: "Bright Minds Scholarship",
      paymentMethod: "Credit Card (4242)",
      date: "2026-07-01T08:15:00Z"
    },
    {
      id: "tx_1003",
      email: "anonymous@user.com",
      name: "Anonymous Donor",
      amount: 1000,
      type: "one-time",
      campaignId: "camp_zero_hunger",
      campaignTitle: "Zero Hunger Project",
      paymentMethod: "PayPal",
      date: "2026-07-05T14:45:00Z"
    }
  ],
  blog: [
    {
      id: "post_1",
      title: "Clean Water Flowing: Our Q2 Impact Report",
      summary: "Thanks to your support, we successfully installed 12 new solar-powered water filtration hubs, serving over 8,000 citizens.",
      content: "<p>We are thrilled to share that our <strong>Clean Water Initiative</strong> has reached a new milestone. Over the past three months, our field teams have worked tirelessly to bring drinking water to remote towns.</p><p>By leveraging solar-powered pumps, we have created an energy-independent and sustainable grid. This decreases waterborne disease incidence by 85% in these areas. Thank you for your continued support!</p>",
      category: "Impact Reports",
      author: "Sophia Carter",
      date: "2026-06-30",
      image: "https://images.unsplash.com/photo-1469571486040-7a9785ad667f?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "post_2",
      title: "Volunteering: The Heartbeat of Social Change",
      summary: "A look into the lives of our local volunteers, and how dedicating a few weekend hours can transform communities.",
      content: "<p>Volunteers are the backbone of Charity Connect. In this spotlight article, we sit down with Marcus, who has been preparing ingredients for our weekend food drives for the past six months.</p><p>\"It is about connecting, meeting people, and realizing that we are all in this together,\" Marcus shares. Discover how you can apply to get involved today.</p>",
      category: "Stories",
      author: "Alex Johnson",
      date: "2026-07-02",
      image: "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "post_3",
      title: "Bracing for the Floods: Emergency Aid Launch",
      summary: "We have activated our Disaster Response unit in response to the torrential rains. Here is how you can help immediately.",
      content: "<p>Following the heavy flash floods, families are in urgent need of clean clothing, non-perishable foodstuffs, and temporary canvas shelter tents.</p><p>We are raising $80,000 to purchase and distribute emergency kits. Read this article to see our donation breakdown and logistic map locations.</p>",
      category: "Announcements",
      author: "Sophia Carter",
      date: "2026-07-09",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
    }
  ],
  notifications: [
    {
      id: "not_1",
      title: "Welcome to Charity Connect",
      message: "Your profile has been created successfully. Explore our active campaigns and start making an impact.",
      date: "2026-07-09T12:00:00Z",
      read: false,
      userEmail: "donor@example.com"
    }
  ]
};

class Store {
  constructor() {
    this.storageKey = "charity_connect_state";
    this.currentUserKey = "charity_connect_current_user";
    this.init();
  }

  init() {
    const rawState = localStorage.getItem(this.storageKey);
    if (!rawState) {
      this.state = DEFAULT_STATE;
      this.save();
    } else {
      try {
        this.state = JSON.parse(rawState);
        // Sync structures in case of schema updates
        for (let key in DEFAULT_STATE) {
          if (!this.state[key]) {
            this.state[key] = DEFAULT_STATE[key];
          }
        }
      } catch (e) {
        this.state = DEFAULT_STATE;
        this.save();
      }
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  // Authentication Methods
  getCurrentUser() {
    const userStr = localStorage.getItem(this.currentUserKey);
    if (!userStr) return null;
    try {
      const parsed = JSON.parse(userStr);
      // Fetch fresh user data from state in case it updated
      return this.state.users.find(u => u.email === parsed.email) || null;
    } catch (e) {
      return null;
    }
  }

  login(email, password) {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error("No user registered with this email address.");
    }
    if (user.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }
    localStorage.setItem(this.currentUserKey, JSON.stringify({ email: user.email, role: user.role }));
    return user;
  }

  register(name, email, password) {
    const exists = this.state.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) {
      throw new Error("An account already exists with this email address.");
    }
    const newUser = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: "donor",
      phone: "",
      location: "",
      paymentMethods: []
    };
    this.state.users.push(newUser);
    
    // Create initial welcome notification
    this.addNotification(newUser.email, "Welcome to Charity Connect!", "Thank you for creating an account! Together we can make a difference.");
    
    this.save();
    
    // Auto-login
    localStorage.setItem(this.currentUserKey, JSON.stringify({ email: newUser.email, role: newUser.role }));
    return newUser;
  }

  logout() {
    localStorage.removeItem(this.currentUserKey);
  }

  resetPassword(email) {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error("We couldn't find an account matching this email address.");
    }
    // Simulate reset link sent
    return true;
  }

  // Profile Methods
  updateProfile(name, phone, location, password) {
    const cur = this.getCurrentUser();
    if (!cur) throw new Error("Authentication required.");
    
    const user = this.state.users.find(u => u.id === cur.id);
    if (!user) throw new Error("User record not found.");
    
    user.name = name.trim();
    user.phone = phone.trim();
    user.location = location.trim();
    if (password) {
      user.password = password;
    }
    
    this.save();
    return user;
  }

  addPaymentMethod(type, cardNum, name, expiry) {
    const cur = this.getCurrentUser();
    if (!cur) throw new Error("Authentication required.");

    const user = this.state.users.find(u => u.id === cur.id);
    if (!user) throw new Error("User record not found.");
    
    if (!user.paymentMethods) user.paymentMethods = [];
    
    const newPm = {
      id: "pm_" + Math.random().toString(36).substr(2, 9),
      type,
      cardNum: type === "card" ? "**** **** **** " + cardNum.slice(-4) : cardNum,
      name,
      expiry
    };
    
    user.paymentMethods.push(newPm);
    this.save();
    return newPm;
  }

  removePaymentMethod(pmId) {
    const cur = this.getCurrentUser();
    if (!cur) throw new Error("Authentication required.");

    const user = this.state.users.find(u => u.id === cur.id);
    if (user && user.paymentMethods) {
      user.paymentMethods = user.paymentMethods.filter(p => p.id !== pmId);
      this.save();
    }
  }

  // Campaigns Methods
  getCampaigns(search = "", category = "All") {
    let list = this.state.campaigns.filter(c => c.active);
    
    if (category !== "All") {
      list = list.filter(c => c.category === category);
    }
    
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    
    return list;
  }

  getCampaignById(id) {
    return this.state.campaigns.find(c => c.id === id);
  }

  // Events Methods
  getEvents(search = "") {
    let list = this.state.events;
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
    }
    // Sort by date ascending
    return list.sort((a,b) => new Date(a.date) - new Date(b.date));
  }

  registerEvent(eventId, email) {
    const ev = this.state.events.find(e => e.id === eventId);
    if (!ev) throw new Error("Event not found.");
    
    if (!ev.registrations.includes(email)) {
      ev.registrations.push(email);
      this.addNotification(email, `Registered for ${ev.title}`, `You have registered successfully for the event scheduled on ${ev.date}. A confirmation email has been simulated.`);
      this.save();
    }
    return ev;
  }

  // Volunteering Methods
  applyVolunteer(name, email, phone, skills, interest) {
    const newVol = {
      id: "vol_" + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      skills: skills.trim(),
      interest: interest,
      status: "pending",
      date: new Date().toISOString().split('T')[0]
    };
    this.state.volunteers.push(newVol);
    this.addNotification(email, "Volunteer Application Submitted", "Your volunteer application is received and is currently under review by our community moderators.");
    this.save();
    return newVol;
  }

  // Donations Methods
  processDonation(name, email, amount, type, campaignId, paymentMethod) {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) throw new Error("Please specify a valid positive donation amount.");
    
    const camp = this.state.campaigns.find(c => c.id === campaignId);
    if (!camp) throw new Error("Campaign not found.");
    
    // Create transaction record
    const donation = {
      id: "tx_" + Math.floor(100000 + Math.random() * 900000),
      email: email.toLowerCase().trim(),
      name: name.trim() || "Anonymous Donor",
      amount: amt,
      type: type, // one-time / recurring
      campaignId: campaignId,
      campaignTitle: camp.title,
      paymentMethod: paymentMethod,
      date: new Date().toISOString()
    };
    
    // Add to donation records
    this.state.donations.push(donation);
    
    // Update campaign raised sum
    camp.raised = (camp.raised || 0) + amt;
    
    // Notify donor (if registered or provided email)
    this.addNotification(email, `Donation Received! - $${amt}`, `Thank you for donating $${amt} to the "${camp.title}" campaign. Your transaction ID is ${donation.id}.`);
    
    this.save();
    return donation;
  }

  // Notifications Methods
  getNotifications(email) {
    return this.state.notifications.filter(n => n.userEmail.toLowerCase() === email.toLowerCase());
  }

  addNotification(email, title, message) {
    this.state.notifications.unshift({
      id: "not_" + Math.random().toString(36).substr(2, 9),
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      userEmail: email.toLowerCase()
    });
    this.save();
  }

  markNotificationsRead(email) {
    this.state.notifications.forEach(n => {
      if (n.userEmail.toLowerCase() === email.toLowerCase()) {
        n.read = true;
      }
    });
    this.save();
  }

  // Blog Methods
  getArticles(category = "All") {
    let list = this.state.blog;
    if (category !== "All") {
      list = list.filter(b => b.category === category);
    }
    // Sort by date descending
    return list.sort((a,b) => new Date(b.date) - new Date(a.date));
  }

  // Admin Dashboard Helpers
  getStats() {
    const totalDonations = this.state.donations.reduce((sum, d) => sum + d.amount, 0);
    
    // Unique donors count (based on email)
    const uniqueDonors = new Set(this.state.donations.map(d => d.email)).size;
    
    const activeCampaigns = this.state.campaigns.filter(c => c.active).length;
    const pendingVolunteers = this.state.volunteers.filter(v => v.status === "pending").length;
    
    return {
      totalDonations,
      uniqueDonors,
      activeCampaigns,
      pendingVolunteers
    };
  }

  getAnalytics() {
    // Generate monthly donations (mocking history over last 6 months for visualization)
    // We will build a dataset representing monthly sums
    const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const sums = [4500, 8200, 11000, 15400, 21000, 27500]; // mock history points + actuals
    
    // Calculate actual total for July 2026 from database
    const julyTotal = this.state.donations
      .filter(d => d.date.startsWith("2026-07"))
      .reduce((sum, d) => sum + d.amount, 0);
    sums[5] = 18000 + julyTotal; // base mock + dynamic donations this month
    
    const campaignsSummary = this.state.campaigns.map(c => ({
      name: c.title,
      raised: c.raised,
      goal: c.goal,
      percentage: Math.min(100, Math.round((c.raised / c.goal) * 100))
    }));
    
    return {
      monthlyLabels: months,
      monthlySums: sums,
      campaignsSummary
    };
  }

  // Admin CRUD Campaign
  createCampaign(title, description, category, goal, image) {
    const newCamp = {
      id: "camp_" + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      category: category,
      goal: parseFloat(goal),
      raised: 0,
      image: image.trim() || "https://images.unsplash.com/photo-1469571486040-7a9785ad667f?w=800",
      active: true
    };
    this.state.campaigns.push(newCamp);
    this.save();
    return newCamp;
  }

  updateCampaign(id, data) {
    const camp = this.state.campaigns.find(c => c.id === id);
    if (!camp) throw new Error("Campaign not found");
    
    camp.title = data.title.trim();
    camp.description = data.description.trim();
    camp.category = data.category;
    camp.goal = parseFloat(data.goal);
    if (data.image) camp.image = data.image.trim();
    
    this.save();
    return camp;
  }

  deleteCampaign(id) {
    const index = this.state.campaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      // Hard delete or deactivate
      this.state.campaigns[index].active = false;
      this.save();
    }
  }

  // Admin CRUD Events
  createEvent(title, description, date, time, location, image) {
    const newEvent = {
      id: "ev_" + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      date: date,
      time: time,
      location: location.trim(),
      image: image.trim() || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
      registrations: []
    };
    this.state.events.push(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id, data) {
    const ev = this.state.events.find(e => e.id === id);
    if (!ev) throw new Error("Event not found");
    
    ev.title = data.title.trim();
    ev.description = data.description.trim();
    ev.date = data.date;
    ev.time = data.time;
    ev.location = data.location.trim();
    if (data.image) ev.image = data.image.trim();
    
    this.save();
    return ev;
  }

  deleteEvent(id) {
    this.state.events = this.state.events.filter(e => e.id !== id);
    this.save();
  }

  // Admin Volunteer Actions
  updateVolunteerStatus(volId, status) {
    const vol = this.state.volunteers.find(v => v.id === volId);
    if (!vol) throw new Error("Volunteer applicant not found.");
    
    vol.status = status; // approved / rejected
    
    // Notify
    this.addNotification(vol.email, `Volunteer Status Updated`, `Your application for "${vol.interest}" has been ${status}.`);
    
    this.save();
    return vol;
  }
}

export const store = new Store();
export default store;
