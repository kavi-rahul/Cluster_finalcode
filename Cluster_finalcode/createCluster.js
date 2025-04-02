import dotenv from "dotenv";
import { exec as _exec } from "child_process";
import { promisify } from "util";

// Load environment variables from .env
dotenv.config();

const exec = promisify(_exec);

// MongoDB Atlas Project & Cluster Details
const projectName = "FinaPro12";  // Project Name
const clusterName = "FinalCluster13";  // Cluster Name
const region = "US_EAST_1";  // Deployment Region
const orgId = "67c3917fddec456349dc4326"; // Fetch Org ID from environment variable

// Check if orgId is available in environment variables
if (!orgId) {
  console.error("❌ Missing ORGANIZATION ID in the .env file.");
  process.exit(1);
}

async function runCommand(command, successMessage) {
  try {
    console.log(`▶ Running: ${command}`);
    const { stdout, stderr } = await exec(command);
    if (stderr) console.warn(`⚠️ STDERR: ${stderr}`);
    
    console.log(`✅ ${successMessage}`);
    console.log(stdout);
    return stdout;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.stderr || error.message);
    throw error;
  }
}

async function createProjectAndCluster() {
  try {
    // Step 1: Get the list of existing projects
    const projectListRaw = await runCommand(
      `atlas projects list --output json`,
      "Fetched project list."
    );

    const projects = JSON.parse(projectListRaw).results;
    let project = projects.find(p => p.name === projectName);
    let projectId = project?.id;

    if (!projectId) {
      // Step 2: Create a new project if it doesn’t exist
      console.log(`ℹ️ Project '${projectName}' does not exist. Creating it...`);
      await runCommand(
        `atlas projects create "${projectName}" --orgId ${orgId}`,
        `Project '${projectName}' created.`
      );

      // Fetch the updated project list
      const updatedProjectListRaw = await runCommand(
        `atlas projects list --output json`,
        "Fetched updated project list."
      );
      const updatedProjects = JSON.parse(updatedProjectListRaw).results;
      project = updatedProjects.find(p => p.name === projectName);
      projectId = project?.id;

      if (!projectId) throw new Error("Failed to retrieve new project ID.");
    } else {
      console.log(`✅ Project '${projectName}' already exists (ID: ${projectId}).`);
    }

    // Step 3: Check if the cluster already exists in the project
    const clusterListRaw = await runCommand(
      `atlas clusters list --projectId ${projectId} --output json`,
      "Fetched cluster list."
    );

    const clusters = JSON.parse(clusterListRaw).results;
    const clusterExists = clusters.some(c => c.name === clusterName);

    if (clusterExists) {
      console.log(`✅ Cluster '${clusterName}' already exists in project '${projectName}'.`);
    } else {
      // Step 4: Create a Free M0 cluster if it doesn’t exist
      console.log(`ℹ️ Cluster '${clusterName}' does not exist. Creating it...`);
      await runCommand(
        `atlas clusters create "${clusterName}" --projectId ${projectId} --provider AWS --region ${region} --tier M0`,
        `Cluster '${clusterName}' (M0) created successfully.`
      );
    }

    console.log("🎉 Project and cluster setup completed successfully.");
  } catch (err) {
    console.error("❌ Failed to create project/cluster:", err.message);
  }
}

createProjectAndCluster();
