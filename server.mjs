const { Bot } = require('grammy');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const BONUS_COINS_PER_REFERRAL = 120; // Define the coins awarded for each referral

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  coins: { type: Number, default: 200 },
  lastFarmingTime: Date,
  farmingCooldownEnd: Date,
  coinsToClaim: { type: Number, default: 0 },
  referralLink: { type: String, unique: true },
  referredBy: { type: String },
  referrals: { type: Number, default: 0 },
  tasks: [
    {
      name: { type: String, required: true },
      points: { type: Number, required: true },
      isCompleted: { type: Boolean, default: false },
    },
  ],
});

const User = mongoose.model('User', userSchema);

// Staff members
const staffIds = [123806789, 987654321]; // Replace these with your actual staff IDs

// Express server setup
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Function to format time left into "hh hours, mm minutes, ss seconds"
function formatTimeLeft(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return `${String(hours).padStart(2, '0')} hours, ${String(minutes).padStart(2, '0')} minutes, ${String(seconds).padStart(2, '0')} seconds`;
}

// Shared farming logic for both API and bot
async function farmCoins(user) {
  const now = new Date();
  const cooldown = 4 * 60 * 60 * 1000; // 4 hours cooldown (was 8 hours)

  // Check if user has unclaimed coins
  if (user.coinsToClaim > 0) {
    return { error: `You have unclaimed coins! Please use /claim to collect your ${user.coinsToClaim} coins before farming again.` };
  }

  // Check if farming cooldown is still active
  if (user.farmingCooldownEnd && now < user.farmingCooldownEnd) {
    const timeLeft = user.farmingCooldownEnd - now;
    return { error: `Please wait ${formatTimeLeft(timeLeft)} to farm again.` };
  }

  // Start a new farming session
  user.coinsToClaim += 45;
  user.lastFarmingTime = now;
  user.farmingCooldownEnd = new Date(now.getTime() + cooldown); // Set new 4-hour cooldown
  await user.save();

  return { message: "Farming initiated! You will be able to claim your 45 coins after 4 hours.", coinsToClaim: user.coinsToClaim };
}

// API endpoint to fetch user data by Telegram ID
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.name,
      coins: user.coins,
      lastFarmingTime: user.lastFarmingTime,
      coinsToClaim: user.coinsToClaim,
      farmingCooldownEnd: user.farmingCooldownEnd,
      referralLink: user.referralLink, // Include referral link
      profilePhoto: user.profilePhoto // Include profile photo
    });
  } catch (error) {
    console.error(`Error fetching user data: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the user data.' });
  }
});

app.get('/api/user/:telegramId', async (req, res) => {
  const telegramId = req.params.telegramId;

  try {
    // Fetch user by telegramId
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send user data to the frontend
    res.json({
      name: user.name,
      coins: user.coins,
      tasks: user.tasks.map(task => ({
        name: task.name,
        points: task.points,
        isCompleted: task.isCompleted,
      })), // Send tasks with name, points, and completion status
      coinsToClaim: user.coinsToClaim,
    });
  } catch (error) {
    console.error(`Error fetching user data: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching user data.' });
  }
});

// API to add a task for a user
app.post('/api/user/:telegramId/add-task', async (req, res) => {
  const { telegramId } = req.params;
  const { taskName, points } = req.body;

  if (!taskName || !points) {
    return res.status(400).json({ error: 'Task name and points are required.' });
  }

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Add the new task to the user's task list
    user.tasks.push({ name: taskName, points, isCompleted: false });
    await user.save();

    res.json({ message: 'Task added successfully.', tasks: user.tasks });
  } catch (error) {
    console.error(`Error adding task: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while adding the task.' });
  }
});

// API to mark a task as completed and reward the user
app.post('/api/user/:telegramId/complete-task', async (req, res) => {
  const { telegramId } = req.params;
  const { taskName } = req.body;

  if (!taskName) {
    return res.status(400).json({ error: 'Task name is required.' });
  }

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Find the task by name
    const task = user.tasks.find(t => t.name === taskName);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.isCompleted) {
      return res.status(400).json({ error: 'Task is already completed.' });
    }

    // Mark the task as completed and award points
    task.isCompleted = true;
    user.coins += task.points;
    await user.save();

    res.json({ message: `Task "${taskName}" completed! You earned ${task.points} coins.`, totalCoins: user.coins });
  } catch (error) {
    console.error(`Error completing task: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while completing the task.' });
  }
});

// API to fetch all tasks for a user
app.get('/api/user/:telegramId/tasks', async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      tasks: user.tasks.map(task => ({
        name: task.name,
        points: task.points,
        isCompleted: task.isCompleted,
      })),
    });
  } catch (error) {
    console.error(`Error fetching tasks: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching tasks.' });
  }
});

// API endpoint to get user's referral link
app.get('/api/user/referral-link/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      referralLink: user.referralLink,
    });
  } catch (error) {
    console.error(`Error fetching referral link: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the referral link.' });
  }
});


// API endpoint to get the user's rank based on their coins
app.get('/api/rank/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user by their Telegram ID
    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count how many users have more coins than the current user
    const higherRankedUsers = await User.countDocuments({ coins: { $gt: user.coins } });

    // The user's rank is the number of users with more coins + 1 (because rank is 1-based)
    const rank = higherRankedUsers + 1;

    // Calculate the rank based on the user's coins
    const rankTitle = getRankByCoins(user.coins);

    res.json({
      name: user.name,
      coins: user.coins,
      rank: rank,
      rankTitle: rankTitle, // Include the rank title (Wood, Iron, etc.)
    });
  } catch (error) {
    console.error(`Error fetching user rank: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the rank.' });
  }
});

// API endpoint to get user's referral info
app.get('/api/user/referral/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the total count of users referred by this user
    const totalReferrals = await User.countDocuments({ referredBy: userId });

    // Fetch referred users
    const referredUsers = await User.find({ referredBy: userId }).select('name coins');

    res.json({
      referralLink: user.referralLink,
      referrals: totalReferrals, // Send total referral count
      referredUsers, // Send the referred users' details (name and coins in this case)
    });
  } catch (error) {
    console.error(`Error fetching referral info: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching referral info.' });
  }
});

// API endpoint to start the bot
app.post('/api/start', async (req, res) => {
  const { telegramId, name } = req.body;

  if (!telegramId || !name) {
    return res.status(400).json({ error: "telegramId and name are required." });
  }

  try {
    const referralLink = `https://t.me/proofcoin_bot/?start=${telegramId}`;

    let user = await User.findOneAndUpdate(
      { telegramId },
      { telegramId, name, referralLink },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `Welcome, ${user.name}!`, referralLink: user.referralLink, coins: user.coins });
  } catch (error) {
    console.error(`Error during user creation: ${error.message}`);
    res.status(500).json({ error: "An error occurred while creating the user." });
  }
});

// API endpoint to add coins to a user
app.post('/api/user/add-coins', async (req, res) => {
  const { telegramId, coins } = req.body;

  if (!telegramId || !coins) {
    return res.status(400).json({ error: "telegramId and coins are required." });
  }

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.coins += coins; // Add coins to user
    await user.save();

    res.json({ message: "Coins added successfully.", totalCoins: user.coins });
  } catch (error) {
    console.error(`Error adding coins: ${error.message}`);
    res.status(500).json({ error: "An error occurred while adding coins." });
  }
});

// API endpoint to farm coins
app.post('/api/farm', async (req, res) => {
  const { telegramId } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required." });
  }

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please start by using the /start command." });
    }

    const farmResult = await farmCoins(user);

    if (farmResult.error) {
      return res.status(403).json({ error: farmResult.error });
    }

    res.json({ message: farmResult.message, coinsToClaim: farmResult.coinsToClaim });
  } catch (error) {
    console.error(`Error farming coins: ${error.message}`);
    res.status(500).json({ error: "An error occurred while farming." });
  }
});

// API endpoint to claim coins
app.post('/api/claim', async (req, res) => {
  const { telegramId } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required." });
  }

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please start by using the /start command." });
    }

    if (user.coinsToClaim <= 0) {
      return res.status(403).json({ error: "You have no coins to claim." });
    }

    // Add the coins to user's total
    user.coins += user.coinsToClaim; 
    user.coinsToClaim = 0; // Reset coins to claim
    await user.save();

    res.json({ message: `You have successfully claimed your coins! Total coins: ${user.coins}` });
  } catch (error) {
    console.error(`Error claiming coins: ${error.message}`);
    res.status(500).json({ error: "An error occurred while claiming coins." });
  }
});

// API endpoint to get the current user data
app.get('/api/current-user', async (req, res) => {
  const telegramId = req.user?.telegramId; // Assuming you're using middleware to set the current user's telegramId

  if (!telegramId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      name: user.name,
      coins: user.coins,
      coinsToClaim: user.coinsToClaim,
      profilePhoto: user.profilePhoto // Include profile photo
    });
  } catch (error) {
    console.error(`Error fetching current user data: ${error.message}`);
    res.status(500).json({ error: "An error occurred while fetching current user data." });
  }
});

// API endpoint to view the leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ coins: -1 }).limit(100); // Top 10 users by coins
    const leaderboard = users.map(user => ({
      name: user.name,
      coins: user.coins,
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(`Error fetching leaderboard: ${error.message}`);
    res.status(500).json({ error: "An error occurred while fetching the leaderboard." });
  }
});

// Command handler for /start
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const name = ctx.from.first_name;

  // Check if the user joined via a referral link
  const messageText = ctx.message?.text;
  const referredBy = messageText?.split(' ')[1]; // Extract the referral code from the /start <referralCode>

  try {
    const referralLink = `https://t.me/proofcoin_bot/?start=${telegramId}`;

    // Check if the new user already exists
    let newUser = await User.findOne({ telegramId });

    if (!newUser) {
      // If new user, create an entry for them
      newUser = await User.create({
        telegramId,
        name,
        referralLink,
        referredBy: referredBy || null, // Store referrer's ID if present
      });

      // If the new user was referred, update the referrer's referral count and add bonus coins
      if (referredBy) {
        const referrer = await User.findOne({ telegramId: referredBy });
        if (referrer) {
          referrer.referrals += 1; // Increment the referrer’s referral count
          referrer.coins += BONUS_COINS_PER_REFERRAL; // Add bonus coins
          await referrer.save();

          // Optional: Notify the referrer about the bonus
          await ctx.telegram.sendMessage(referrer.telegramId, `🎉 You have received ${BONUS_COINS_PER_REFERRAL} bonus coins for referring a new user!`);
        }
      }

      await ctx.reply(
        `Welcome, ${newUser.name}! to the $ProofCoin Farming Bot! 🌟\n\nUse the buttons below to start farming and earning $ProofCoins. You have ${newUser.coins || 0} coins.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Play', url: 'https://t.me/proofcoin_bot/proofcoin' }],
              [{ text: 'Community', url: 'https://t.me/proofcointon' }],
              [{ text: 'Website', url: 'https://topfoundation.co' }],
            ],
          },
        }
      );
    } else {
      // If user already exists, just welcome them back
      await ctx.reply(
        `Welcome back, ${newUser.name}! You have ${newUser.coins} coins. Keep farming to earn more!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Play', url: 'https://t.me/proofcoin_bot/proofcoin' }],
              [{ text: 'Community', url: 'https://t.me/proofcointon' }],
              [{ text: 'Website', url: 'https://topfoundation.co' }],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.error(`Error handling /start command: ${error.message}`);
    ctx.reply("An error occurred while starting. Please try again later.");
  }
});

// Command handler for /farm
bot.command('farm', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      return ctx.reply("User not found. Please start by using the /start command.");
    }

    const farmResult = await farmCoins(user);

    if (farmResult.error) {
      return ctx.reply(farmResult.error);
    }

    ctx.reply(farmResult.message);
  } catch (error) {
    console.error(`Error handling /farm command: ${error.message}`);
    ctx.reply("An error occurred while farming. Please try again later.");
  }
});

// Command handler for /claim
bot.command('claim', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      return ctx.reply("User not found. Please start by using the /start command.");
    }

    if (user.coinsToClaim <= 0) {
      return ctx.reply("You have no coins to claim.");
    }

    // Add the coins to user's total
    user.coins += user.coinsToClaim; 
    user.coinsToClaim = 0; // Reset coins to claim
    await user.save();

    ctx.reply(`You have successfully claimed your coins! Total coins: ${user.coins}`);
  } catch (error) {
    console.error(`Error handling /claim command: ${error.message}`);
    ctx.reply("An error occurred while claiming coins. Please try again later.");
  }
});

// Command handler for /leaderboard
bot.command('leaderboard', async (ctx) => {
  try {
    const users = await User.find().sort({ coins: -1 }).limit(100); // Fetch top 100 users by coins

    if (users.length === 0) {
      return ctx.reply("No users found in the leaderboard.");
    }

    const leaderboardMessage = users.map((user, index) => {
      const rankTitle = getRankByCoins(user.coins);
      return `${index + 1}. ${user.name} - ${user.coins} coins - ${rankTitle}`;
    }).join('\n');

    ctx.reply(`🏆 Leaderboard:\n${leaderboardMessage}`);
  } catch (error) {
    console.error(`Error handling /leaderboard command: ${error.message}`);
    ctx.reply("An error occurred while fetching the leaderboard. Please try again later.");
  }
});

// Start the bot
bot.start();
