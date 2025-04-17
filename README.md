# Prerequisites
- Node.js installed on EC2
- MongoDB Atlas CLI installed and configured with an API key
- Git configured on EC2
- MongoDB Atlas Org ID and URI
# Install Dependencies
- npm install dotenv
- sudo yum install -y nodejs
- curl -s https://raw.githubusercontent.com/mongodb/mongodb-atlas-cli/main/install-atlas-cli.sh | bash
# Clone the GitHub Repository and Switch Branch
- git clone https://github.com/your-username/your-repo.git
- cd your-repo
# Run the Script
- node createCluster.js (file name)
