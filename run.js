const { commentOnPost } = require('./commenter');

const postUrl = process.argv[2];
const commentText = process.argv.slice(3).join(' ');

if (!postUrl || !commentText) {
  console.error(
    'Usage: node run.js "<linkedin_post_url>" "<comment_text>"'
  );
  process.exit(1);
}

commentOnPost(postUrl, commentText)
  .then(() => console.log('✅ Comment posted successfully'))
  .catch(err => {
    console.error('❌ Error posting comment:', err);
    process.exit(1);
  });
