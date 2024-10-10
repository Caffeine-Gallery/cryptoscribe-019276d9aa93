import Bool "mo:base/Bool";
import Func "mo:base/Func";
import Int "mo:base/Int";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Time "mo:base/Time";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";

actor {
  // Define the structure for a blog post
  public type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Text;
    timestamp: Int;
  };

  // Stable variable to store posts
  stable var posts : List.List<Post> = List.nil();
  stable var nextId : Nat = 0;

  // Function to add a new post
  public func addPost(title: Text, body: Text, author: Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newPost : Post = {
      id = id;
      title = title;
      body = body;
      author = author;
      timestamp = Time.now();
    };
    posts := List.push(newPost, posts);
    id
  };

  // Function to get all posts, sorted by timestamp (most recent first)
  public query func getPosts() : async [Post] {
    let sortedPosts = List.toArray(posts);
    Array.sort(sortedPosts, func(a: Post, b: Post) : { #less; #equal; #greater } {
      if (a.timestamp > b.timestamp) { #less }
      else if (a.timestamp < b.timestamp) { #greater }
      else { #equal }
    })
  };

  // Function to get a single post by ID
  public query func getPost(id: Nat) : async ?Post {
    List.find(posts, func (p: Post) : Bool { p.id == id })
  };
}
