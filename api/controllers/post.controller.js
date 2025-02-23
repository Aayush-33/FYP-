import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    // Build the where clause
    const whereClause = {};
    
    // Handle verification status with explicit boolean conversion
    // Handle verification status - explicitly converting query string to boolean
    if (query.showUnverified === 'true') {
      // If showUnverified is true, show all posts regardless of verification status
      console.log("Showing all posts (verified and unverified)");
    } else if (query.showUnverified === 'false') {
      // If showUnverified is false, only show unverified posts (for admin verification UI)
      console.log("Filtering to only show unverified posts");
      whereClause.isVerified = false;
    } else {
      // By default, only show verified posts
      console.log("Filtering to only show verified posts");
      whereClause.isVerified = true;
    }
    
    // Add filters only if they exist in the query
    if (query.city) whereClause.city = query.city;
    if (query.type) whereClause.type = query.type;
    if (query.property) whereClause.property = query.property;
    if (query.bedroom && !isNaN(parseInt(query.bedroom))) {
      whereClause.bedroom = parseInt(query.bedroom);
    }
    
    // Handle price range filtering
    if (query.minPrice || query.maxPrice) {
      whereClause.price = {};
      
      if (query.minPrice && !isNaN(parseInt(query.minPrice))) {
        whereClause.price.gte = parseInt(query.minPrice);
      }
      
      if (query.maxPrice && !isNaN(parseInt(query.maxPrice))) {
        whereClause.price.lte = parseInt(query.maxPrice);
      }
    }

    console.log("Search filters:", JSON.stringify(whereClause));

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    console.log(`Found ${posts.length} posts matching criteria`);
    
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error in getPosts:", err);
    res.status(500).json({ message: "Failed to get posts", error: err.message });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
        return res.status(200).json({ ...post, isSaved: false });
      });
    } else {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const updateData = req.body;

  try {
    console.log(`Attempting to update post ${id} with data:`, updateData);
    
    // First check if the post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If only updating status, allow the owner to do it
    // For other changes, ensure only the creator can modify
    const isStatusUpdateOnly = Object.keys(updateData).length === 1 && 'status' in updateData;
    
    if (!isStatusUpdateOnly && post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    console.log(`Post ${id} updated successfully with status: ${updatedPost.status}`);
    
    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Failed to update post", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const getAllPostDetails = async (req, res) => {
  try {
    const postDetails = await prisma.postDetail.findMany({
      include: {
        post: {
          select: {
            title: true,
            price: true,
            city: true,
            address: true,
            type: true,
            property: true,
            images: true,
            user: {
              select: {
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    res.status(200).json(postDetails);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post details" });
  }
};

export const getSinglePostDetail = async (req, res) => {
  const id = req.params.id;
  
  try {
    const postDetail = await prisma.postDetail.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            address: true,
            type: true,
            property: true,
            status: true,
            images: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    if (!postDetail) {
      return res.status(404).json({ message: "Post detail not found" });
    }
    
    // Add the postId directly to the response for easier access
    const responseData = {
      ...postDetail,
      postId: postDetail.post.id
    };
    
    res.status(200).json(responseData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post detail" });
  }
};

export const verifyPost = async (req, res) => {
  const id = req.params.id;
  
  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { isVerified: true },
    });
    
    res.status(200).json({ 
      message: "Post has been verified successfully",
      post: updatedPost 
    });
  } catch (err) {
    console.log("Error in verifyPost:", err);
    res.status(500).json({ message: "Failed to verify post" });
  }
};
