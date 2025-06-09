
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 4000;

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
const url = "mongodb+srv://donamaryshaju:dona@cluster0.knlqqgn.mongodb.net/bankdb?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB connection error:", err));

// Schema and Model
const accountSchema = new mongoose.Schema({
  id: Number,
  name: String,
  balance: Number
});

const Account = mongoose.model("bankcollection", accountSchema);

// Home - View All Accounts
app.get("/", async (req, res) => {
  const accounts = await Account.find();
  res.render("allAccounts", { accountList: accounts });
});

// Add Account - GET
app.get("/addAccount", (req, res) => {
  res.render("addAccount");
});

// Add Account - POST
app.post("/insert", async (req, res) => {
  const newAccount = new Account({
    id: parseInt(req.body.id),
    name: req.body.name,
    balance: parseFloat(req.body.balance)
  });

  try {
    await newAccount.save();
    res.redirect("/");
  } catch (err) {
    res.send("Error creating account: " + err.message);
  }
});

// Deposit - GET
app.get("/deposit", async (req, res) => {
  const accounts = await Account.find();
  res.render("deposit", { accounts: accounts });
});

// Deposit - POST
app.post("/deposit/:id", async (req, res) => {
  const accountId = req.params.id;
  const amount = parseFloat(req.body.amount);

  try {
    const account = await Account.findById(accountId);
    if (!account) return res.send("Account not found");

    account.balance += amount;
    await account.save();
    res.redirect("/");
  } catch (err) {
    res.send("Error occurred during deposit: " + err.message);
  }
});

// ✅ Withdraw - GET
app.get("/withdraw", async (req, res) => {
  try {
    const accounts = await Account.find(); // get accounts from DB
    res.render("withdraw", { accounts });  // pass as 'accounts'
  } catch (err) {
    console.error(err);
    res.send("Error loading withdraw page");
  }
});

// ✅ Withdraw - POST using _id from URL
app.post("/withdraw/:id", async (req, res) => {
  const accountId = req.params.id;
  const amount = parseFloat(req.body.amount);

  try {
    const account = await Account.findById(accountId);
    if (!account) return res.send("Account not found");

    if (amount > account.balance) {
      return res.send("❌ Not enough balance to withdraw.");
    }

    account.balance -= amount;
    await account.save();
    res.redirect("/");
  } catch (err) {
    res.send("Error occurred during withdrawal: " + err.message);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
