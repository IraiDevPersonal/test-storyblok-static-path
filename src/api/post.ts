export type PostModel = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export async function fetchPosts() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts?userId=8",
  );
  const data = await response.json();
  return data as PostModel[];
}
