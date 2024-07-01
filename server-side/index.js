import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

dotenv.config();

// Global Variables
const User_Registration_Fields = [
  "username",
  "email",
  // Below are created by sever
  // "badge",
  // "role",
  // "membershipStatus",
  // "createdAt",
  // "aboutMe", // Optional
];

const Post_Insert_Fields = [
  "authorEmail",
  "authorName",
  "authorImage",
  "title",
  "description",
  "tags",
  // "createdAt",
  // "upVotes",
  // "downVotes",
  // "visibility", // Optional
];

const Comment_Insert_Fields = [
  "authorEmail",
  "authorName",
  "authorImage",
  "postId",
  "comment",
  // "createdAt",
  // "reported", // For Report
  // "feedback", // For Report
];

const Announcement_Insert_Fields = [
  "authorImage",
  "authorName",
  "title",
  "description",
];

// Configuring App
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://chatter-box-x.vercel.app"],
    credentials: true,
  })
);
app.use(cookieParser());

// Configuring Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poi1lw7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});
let db;

// Cookie Options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

// Authentication Middleware
const checkTokenAuthentication = (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed!" });
  }

  try {
    const decrypted = jwt.verify(access_token, process.env.JWT_SECRET);
    req.user = decrypted;
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed!" });
  }

  next();
};

// Admin Middleware
const checkAdminAuthentication = async (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed!" });
  }

  try {
    const decrypted = jwt.verify(access_token, process.env.JWT_SECRET);
    req.user = decrypted;
    const query = { email: decrypted.email };
    const dbResult = await db.collection("users").findOne(query);
    if (dbResult.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden Request" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed!" });
  }

  next();
};

// Test Route
app.get("/", async (req, res) => {
  res.json({ status: "success", message: "Server is Running!" });
});

// Create and Set JWT Token
app.post("/authentication", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false });
    return;
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res
    .cookie("access_token", token, cookieOptions)
    .status(200)
    .json({ success: true });
});

// Remove JWT Token
app.get("/logout", async (req, res) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed!" });
  }

  res
    .clearCookie("access_token", cookieOptions)
    .status(200)
    .json({ success: true });
});

// ROUTE: Users
// Create new User: Public Route
app.post("/users", async (req, res) => {
  let { email, username } = req.body;

  if (!email || !username) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Body Request" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  const doc = {
    email,
    username,
    badge: "bronze",
    role: "user",
    membershipStatus: "Free",
    createdAt: new Date().toJSON(),
  };

  let result, status;
  try {
    const dbResult = await db.collection("users").insertOne(doc);
    result = { success: true, ...dbResult };
    status = 200;
  } catch (error) {
    result = {
      success: false,
      message: "User already Exists!",
    };
    status = 201;
  }

  res.cookie("access_token", token, cookieOptions).status(status).json(result);
});

// Get Single User Data: Private Route
app.get("/me", checkTokenAuthentication, async (req, res) => {
  const { email } = req.user;
  const query = { email };

  let result, status;
  try {
    const dbResult = await db.collection("users").findOne(query);
    result = dbResult
      ? { success: true, ...dbResult }
      : { success: false, message: "User not Found!" };
    status = dbResult ? 200 : 404;
  } catch (error) {
    result = { success: false, message: "Server Error", error: error.message };
    status = 500;
  }
  res.status(status).json(result);
});

// Update User: Private Route
app.put("/users/:id", checkTokenAuthentication, async (req, res) => {
  const email = req.params.email;
  const id = req.params.id;

  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid User id Provided" });
    return;
  }

  let { aboutMe } = req.body;
  if (!aboutMe) {
    return res.status(400).json({ success: false, message: "Invalid Request" });
  }

  let result, status;
  try {
    const doc = {
      $set: { aboutMe },
    };
    const dbResult = await db.collection("users").updateOne(query, doc);

    result =
      dbResult.matchedCount === 0
        ? { success: false, message: "User not Found!" }
        : dbResult.modifiedCount === 0
        ? { success: false, message: "User Data wasn't updated" }
        : { success: true, ...dbResult };
    status =
      dbResult.matchedCount === 0
        ? 404
        : dbResult.modifiedCount === 0
        ? 400
        : 200;
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Update User Information",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Get User Stats: Private Route
app.get("/user/stats", checkTokenAuthentication, async (req, res) => {
  const { email: tokenEmail } = req.user;
  const postQuery = { authorEmail: tokenEmail };

  let result, status;
  try {
    const posts = await db.collection("posts").find(postQuery).toArray();

    for (let i = 0; i < posts.length; i++) {
      const commentsCount = await db
        .collection("comments")
        .countDocuments({ postId: String(posts[i]._id) });
      posts[i]["commentsCount"] = commentsCount;
    }
    const postsCount = posts.length;
    const commentsCount = posts.reduce(
      (pre, cur) => pre + cur.commentsCount,
      0
    );

    result = { success: true, postsCount, commentsCount };
    status = 200;
  } catch (error) {
    console.log(error);
    result = {
      success: false,
      message: "Failed to Parse Data",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Get User Posts: Private Route
app.get("/user/posts", checkTokenAuthentication, async (req, res) => {
  const { email: tokenEmail } = req.user;
  const { limit = 10, skip = 0 } = req.query;

  const postQuery = { authorEmail: tokenEmail };

  let result = [],
    status,
    count;
  try {
    result = await db
      .collection("posts")
      .find(postQuery)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();
    count = await db.collection("posts").countDocuments(postQuery);
    status = 200;
  } catch (error) {
    console.log(error);
    result = {
      success: false,
      message: "Failed to Parse Data",
      error: error.message,
    };
    status = 500;
  }

  for (let i = 0; i < result.length; i++) {
    const commentsCount = await db
      .collection("comments")
      .countDocuments({ postId: String(result[i]._id) });
    result[i]["commentsCount"] = commentsCount;
  }

  if (status === 200) {
    res.status(status).json({ success: true, result, count });
  } else {
    res.status(status).json(result);
  }
});

// Make User Premium: Private Route
app.put("/user/premium", checkTokenAuthentication, async (req, res) => {
  const { email: tokenEmail } = req.user;

  const doc = {
    $set: {
      membershipStatus: "Premium",
      badge: "gold",
    },
  };

  const query = {
    email: tokenEmail,
  };

  let result, status;
  try {
    const dbResult = await db.collection("users").updateOne(query, doc);

    result =
      dbResult.matchedCount === 0
        ? { success: false, message: "User not Found!" }
        : dbResult.modifiedCount === 0
        ? { success: false, message: "Failed to Be Premium" }
        : { success: true, ...dbResult };
    status =
      dbResult.matchedCount === 0
        ? 404
        : dbResult.modifiedCount === 0
        ? 400
        : 200;
  } catch (error) {
    result = {
      success: false,
      message: "Server Error",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// ROUTE: Posts
// Create new Post: Private Route
app.post("/posts", checkTokenAuthentication, async (req, res) => {
  let body = req.body;
  const createdAt = new Date().toJSON();

  const allData = Post_Insert_Fields.every((item) =>
    Object.keys(body).includes(item)
  );

  if (!allData) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Body Request" });
  }

  const newBody = {};
  Post_Insert_Fields.forEach((item) => {
    const dt = body[item];
    if (dt) {
      newBody[item] = dt;
    }
  });
  body = { ...newBody, createdAt };

  const { authorEmail: email } = body;
  const { email: tokenEmail } = req.user;
  if (email !== tokenEmail) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden Request" });
  }

  body["upVotes"] = 0;
  body["downVotes"] = 0;
  let result, status;
  try {
    const dbResult = await db.collection("posts").insertOne(body);
    result = { success: true, ...dbResult };
    status = 200;
  } catch (error) {
    result = {
      success: false,
      message: "Server Error Occurred",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Get All Posts: Public Route
app.get("/posts", async (req, res) => {
  const { limit = 5, skip = 0, sortByVote, tag } = req.query;
  let query = {};
  let pipeline = [
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];

  if (sortByVote && sortByVote === "true") {
    pipeline.push(
      {
        $addFields: {
          voteDifference: { $subtract: ["$upVotes", "$downVotes"] },
        },
      },
      {
        $sort: { voteDifference: -1 },
      }
    );
  }
  if (tag) {
    pipeline.push({
      $match: {
        tags: { $regex: tag, $options: "i" },
      },
    });
    query = {
      tags: { $regex: tag, $options: "i" },
    };
  }

  pipeline.push({
    $skip: Number(skip),
  });

  let result, status;
  try {
    const count = await db.collection("posts").countDocuments(query);
    const dbResult = await db
      .collection("posts")
      .aggregate(pipeline)
      .limit(Number(limit))
      .toArray();

    result = { success: true, result: dbResult, count };
    status = 200;
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }

  for (let i = 0; i < result.result.length; i++) {
    const commentsCount = await db
      .collection("comments")
      .countDocuments({ postId: String(result.result[i]._id) });
    result.result[i]["commentsCount"] = commentsCount;
  }

  res.status(status).json(result);
});

// Get Single Post: Public Route
app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Post id Provided" });
    return;
  }

  let result, status;
  try {
    const dbResult = await db.collection("posts").findOne(query);
    const commentsCount = await db
      .collection("comments")
      .countDocuments({ postId: String(dbResult._id) });
    result = dbResult
      ? { success: true, ...dbResult, commentsCount }
      : { success: false, message: "Post not Found!" };
    status = dbResult ? 200 : 404;
  } catch (error) {
    result = { success: false, message: "Post not Found!" };
    status = 404;
  }
  res.status(status).json(result);
});

// Update Post: Private Route
app.put("/posts/:id", checkTokenAuthentication, async (req, res) => {
  const id = req.params.id;
  let body = req.body;

  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Post id Provided" });
    return;
  }

  const oldItem = await db.collection("posts").findOne(query);
  if (!oldItem) {
    res.status(404).json({ success: false, message: "Post not Found" });
    return;
  }

  // const { email: tokenEmail } = req.user;
  // if (oldItem.authorEmail !== tokenEmail) {
  //   return res
  //     .status(403)
  //     .json({ success: false, message: "Forbidden Request" });
  // }

  const newBody = {};
  Post_Insert_Fields.forEach((item) => {
    const dt = body[item];
    if (
      dt &&
      !["authorImage", "authorEmail", "authorName", "createdAt"].includes(item)
    ) {
      newBody[item] = dt;
    }
  });
  body = newBody;

  if (Object.keys(body).length === 0) {
    res.status(400).json({ success: false, message: "Invalid Body Request" });
    return;
  }

  let result, status;
  try {
    const doc = {
      $set: body,
    };
    const dbResult = await db.collection("posts").updateOne(query, doc);

    result =
      dbResult.matchedCount === 0
        ? { success: false, message: "Post not Found!" }
        : dbResult.modifiedCount === 0
        ? { success: false, message: "Post Data wasn't updated" }
        : { success: true, ...dbResult };
    status =
      dbResult.matchedCount === 0
        ? 404
        : dbResult.modifiedCount === 0
        ? 400
        : 200;
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Update Post",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Delete Post: Private Route
app.delete("/posts/:id", checkTokenAuthentication, async (req, res) => {
  const id = req.params.id;
  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Item id Provided" });
    return;
  }

  // const { email } = req.user;
  // query["authorEmail"] = email

  let result, status;
  try {
    const dbResult = await db.collection("posts").deleteOne(query);
    result =
      dbResult.deletedCount > 0
        ? { success: true, ...dbResult }
        : { success: false, message: "Post not Found!" };
    status = dbResult.deletedCount > 0 ? 200 : 404;
    // Delete Comments associated with the Post
    if (status === 200) {
      await db.collection("comments").deleteMany({ postId: id });
    }
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Delete Item",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Increment Upvote of Post: Protected Route
app.put(
  "/posts/:id/:voteType/:updateType",
  checkTokenAuthentication,
  async (req, res) => {
    const { id, voteType, updateType } = req.params;
    if (
      !["upvote", "downvote"].includes(voteType) ||
      !["add", "remove"].includes(updateType)
    ) {
      return res.sendStatus(404);
    }

    let query;
    try {
      query = { _id: new ObjectId(String(id)) };
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Post id Provided" });
      return;
    }

    const doc = {};
    if (voteType === "upvote") {
      if (updateType === "add") {
        doc["$inc"] = { upVotes: 1 };
      } else if (updateType === "remove") {
        doc["$inc"] = { upVotes: -1 };
      }
    } else if (voteType === "downvote") {
      if (updateType === "add") {
        doc["$inc"] = { downVotes: 1 };
      } else if (updateType === "remove") {
        doc["$inc"] = { downVotes: -1 };
      }
    }

    let result, status;
    try {
      const dbResult = await db.collection("posts").updateOne(query, doc);

      result =
        dbResult.matchedCount === 0
          ? { success: false, message: "Post not Found!" }
          : dbResult.modifiedCount === 0
          ? { success: false, message: "Post Data wasn't updated" }
          : { success: true, ...dbResult };
      status =
        dbResult.matchedCount === 0
          ? 404
          : dbResult.modifiedCount === 0
          ? 400
          : 200;
    } catch (error) {
      result = {
        success: false,
        message: "Failed to Update Post",
        error: error.message,
      };
      status = 500;
    }

    res.status(status).json(result);
  }
);

// ROUTE: Comments
// Create Comment: Protected Route
app.post("/comments", checkTokenAuthentication, async (req, res) => {
  let body = req.body;
  const createdAt = new Date().toJSON();

  const allData = Comment_Insert_Fields.every((item) =>
    Object.keys(body).includes(item)
  );

  if (!allData) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Comment Request" });
  }

  const newBody = {};
  Comment_Insert_Fields.forEach((item) => {
    const dt = body[item];
    if (dt) {
      newBody[item] = dt;
    }
  });

  body = { ...newBody, createdAt };
  let query;
  try {
    query = { _id: new ObjectId(String(body.postId)) };
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Post id Provided" });
    return;
  }

  let result, status;
  try {
    const dbResult = await db.collection("comments").insertOne(body);
    result = { success: true, ...dbResult };
    status = 200;
  } catch (error) {
    result = {
      success: false,
      message: "Server Error Occurred",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Get Comments of a Post: Public Route
app.get("/comments/:postId", async (req, res) => {
  const postId = req.params.postId;
  const { limit = 10, skip = 0 } = req.query;
  const query = { postId };

  let result, status;
  try {
    const dbResult = await db
      .collection("comments")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();
    const count = await db.collection("comments").countDocuments(query);
    result = { success: true, result: dbResult, count };
    status = 200;
  } catch (error) {
    result = { success: false, message: "Server Error", error: error.message };
    status = 500;
  }
  res.status(status).json(result);
});

// Report a Comment: Private-Protected Route
app.post("/comments/:id/report", checkTokenAuthentication, async (req, res) => {
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ success: false, message: "Invalid Request" });
  }

  const id = req.params.id;
  let query;
  try {
    query = { _id: new ObjectId(String(id)) };
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Post id Provided" });
    return;
  }

  const comment = await db.collection("comments").findOne(query);
  if (!comment) {
    return res
      .status(404)
      .json({ success: false, message: "Comment not Found!" });
  }
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(String(comment.postId)) });
  if (!post) {
    return res
      .status(404)
      .json({ success: false, message: "Comment not Found!" });
  }

  //   if (post.authorEmail !== req.user.email) {
  //     return res
  //       .status(403)
  //       .json({ success: false, message: "Forbidden Request" });
  //   }

  const doc = {
    $set: {
      reported: true,
      feedback,
    },
  };

  let result, status;
  try {
    const dbResult = await db.collection("comments").updateOne(query, doc);

    result =
      dbResult.matchedCount === 0
        ? { success: false, message: "Comment not Found!" }
        : dbResult.modifiedCount === 0
        ? { success: false, message: "Feedback isn't added" }
        : { success: true, ...dbResult };
    status =
      dbResult.matchedCount === 0
        ? 404
        : dbResult.modifiedCount === 0
        ? 400
        : 200;
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Insert report",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// ROUTE: Tags
// Get Tags: Public Route
app.get("/tags", async (req, res) => {
  const result = await db.collection("tags").find().toArray();

  for (let i = 0; i < result.length; i++) {
    const postCount = await db
      .collection("posts")
      .countDocuments({ tags: result[i].tag });
    result[i]["postCount"] = postCount;
  }

  res.status(200).json({ success: true, result });
});

// ROUTE: Announcements
// Get Announcements: Public Route
app.get("/announcements", async (req, res) => {
  let result, status;
  try {
    const dbResult = await db.collection("announcements").find().toArray();
    result = { success: true, result: dbResult };
    status = 200;
  } catch (error) {
    status = 500;
    result = { success: false, message: "Server Error", error: error.message };
  }

  res.status(status).json(result);
});

// Get Announcements Count: Public Route
app.get("/announcements/count", async (req, res) => {
  let result, status;
  try {
    const count = await db.collection("announcements").estimatedDocumentCount();
    result = { success: true, count };
    status = 200;
  } catch (error) {
    status = 500;
    result = { success: false, message: "Server Error", error: error.message };
  }

  res.status(status).json(result);
});

// ROUTE: Admin
// Get Stats
app.get("/admin/stats", checkAdminAuthentication, async (req, res) => {
  let result, status;
  try {
    const usersCount = await db.collection("users").estimatedDocumentCount();
    const postsCount = await db.collection("posts").estimatedDocumentCount();
    const commentsCount = await db
      .collection("comments")
      .estimatedDocumentCount();
    result = { success: true, usersCount, postsCount, commentsCount };
    status = 200;
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Delete Tag",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Get Multiple Users Data
app.get("/admin/users", checkAdminAuthentication, async (req, res) => {
  const { limit = 10, skip = 0, username = "" } = req.query;
  const query = { username: { $regex: username, $options: "i" } };
  let result, status;
  try {
    const dbResult = await db
      .collection("users")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();
    const count = await db.collection("users").countDocuments(query);
    result = { success: true, result: dbResult, count };
    status = 200;
  } catch (error) {
    result = { success: false, message: "Server Error", error: error.message };
    status = 500;
  }
  res.status(status).json(result);
});

// Update User
app.put(
  "/admin/users/make-admin",
  checkAdminAuthentication,
  async (req, res) => {
    const { id } = req.body;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Post id Provided" });
      return;
    }

    const doc = {
      $set: {
        role: "admin",
      },
    };

    let result, status;
    try {
      const dbResult = await db.collection("users").updateOne(query, doc);

      result =
        dbResult.matchedCount === 0
          ? { success: false, message: "User not Found!" }
          : dbResult.modifiedCount === 0
          ? { success: false, message: "User Data wasn't updated" }
          : { success: true, ...dbResult };
      status =
        dbResult.matchedCount === 0
          ? 404
          : dbResult.modifiedCount === 0
          ? 400
          : 200;
    } catch (error) {
      result = {
        success: false,
        message: "Failed to Update User Information",
        error: error.message,
      };
      status = 500;
    }

    res.status(status).json(result);
  }
);

// Get Reported Comments
app.get(
  "/admin/reported-comments",
  checkAdminAuthentication,
  async (req, res) => {
    const { limit = 10, skip = 0 } = req.query;
    const query = { reported: true };
    let result, status;
    try {
      const dbResult = await db
        .collection("comments")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .toArray();
      const count = await db.collection("comments").countDocuments(query);
      result = { success: true, result: dbResult };
      status = 200;
    } catch (error) {
      result = {
        success: false,
        message: "Failed to Get Comments",
        error: error.message,
      };
      status = 500;
    }
    res.status(status).json(result);
  }
);

// Delete a Comment
app.delete(
  "/admin/comments/:id",
  checkAdminAuthentication,
  async (req, res) => {
    const id = req.params.id;

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Item id Provided" });
      return;
    }

    let result, status;
    try {
      const dbResult = await db.collection("comments").deleteOne(query);
      result =
        dbResult.deletedCount > 0
          ? { success: true, ...dbResult }
          : { success: false, message: "Comment not Found!" };
      status = dbResult.deletedCount > 0 ? 200 : 404;
    } catch (error) {
      result = {
        success: false,
        message: "Failed to Delete Comment",
        error: error.message,
      };
      status = 500;
    }

    res.status(status).json(result);
  }
);

// Create new Tags
app.post("/admin/tags", checkAdminAuthentication, async (req, res) => {
  const { tag } = req.body;

  let result, status;
  try {
    const dbResult = await db.collection("tags").insertOne({ tag });
    result = { success: true, ...dbResult };
    status = 200;
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Insert Tag",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Delete a Tag
app.delete("/admin/tags/:id", checkAdminAuthentication, async (req, res) => {
  const id = req.params.id;

  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid id Provided" });
    return;
  }

  let result, status;
  try {
    const dbResult = await db.collection("tags").deleteOne(query);
    result =
      dbResult.deletedCount > 0
        ? { success: true, ...dbResult }
        : { success: false, message: "Tag not Found!" };
    status = dbResult.deletedCount > 0 ? 200 : 404;
  } catch (error) {
    result = {
      success: false,
      message: "Failed to Delete Tag",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Create an Announcement
app.post("/admin/announcements", checkAdminAuthentication, async (req, res) => {
  let body = req.body;

  const allData = Announcement_Insert_Fields.every((item) =>
    Object.keys(body).includes(item)
  );

  if (!allData) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Announcement Request" });
  }

  const newBody = {};
  Announcement_Insert_Fields.forEach((item) => {
    const dt = body[item];
    if (dt) {
      newBody[item] = dt;
    }
  });

  body = newBody;

  let result, status;
  try {
    const dbResult = await db.collection("announcements").insertOne(body);
    result = { success: true, ...dbResult };
    status = 200;
  } catch (error) {
    result = {
      success: false,
      message: "Server Error Occurred",
      error: error.message,
    };
    status = 500;
  }

  res.status(status).json(result);
});

// Delete am Announcement
app.delete(
  "/admin/announcements/:id",
  checkAdminAuthentication,
  async (req, res) => {
    const id = req.params.id;

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid id Provided" });
      return;
    }

    let result, status;
    try {
      const dbResult = await db.collection("announcements").deleteOne(query);
      result =
        dbResult.deletedCount > 0
          ? { success: true, ...dbResult }
          : { success: false, message: "Announcement not Found!" };
      status = dbResult.deletedCount > 0 ? 200 : 404;
    } catch (error) {
      result = {
        success: false,
        message: "Failed to Delete Announcement",
        error: error.message,
      };
      status = 500;
    }

    res.status(status).json(result);
  }
);

// ROUTE: Payment
app.post(
  "/create-payment-intent",
  checkTokenAuthentication,
  async (req, res) => {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5 * 1000, // $5
      currency: "usd",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }
);

// Connecting to MongoDB first, then Starting the Server
client
  .connect()
  .then(async () => {
    db = client.db("chatter-box");
    app.listen(port, () => {
      console.log(`Running in port ${port}`);
    });
  })
  .catch(console.dir);
