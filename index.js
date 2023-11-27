#!/usr/bin/env node
// @ts-check
const fs = require("node:fs/promises");
const dependencyTree = require("dependency-tree");

/** @typedef {"node_modules" | "use server" | "use client" | "none"} Property */
/** @typedef {{ path: string, property: Property, children: TreeNode[] }} TreeNode */
/** @typedef {TreeNode[]} Tree */

/**
 * @param fileContent {string}
 * @param directive {"client" | "server"}
 * @returns {boolean}
 */
function checkForDirective(fileContent, directive) {
  // remove comments at the beginning of the file, both // and /* */
  const removedCommentsContent = fileContent
    .replace(/^(?<comments>\/\/.*|\/\*.*\*\/)/, "")
    .trimStart();
  return (
    removedCommentsContent.startsWith(`"use ${directive}"`) ||
    removedCommentsContent.startsWith(`'use ${directive}'`)
  );
}

/**
 * @param path {string}
 * @returns {Promise<Property>}
 */
async function getPropertyOfPath(path) {
  if (path.includes("node_modules")) return "node_modules";
  const fileContent = await fs.readFile(path, "utf-8");
  if (checkForDirective(fileContent, "client")) return "use client";
  if (checkForDirective(fileContent, "server")) return "use server";
  return "none";
}

/**
 * @param inputTree {import("dependency-tree").Tree}
 * @param parentProperty {Property}
 * @returns {Promise<Tree>}
 */
async function checkTree(inputTree, parentProperty) {
  if (typeof inputTree === "string") {
    throw new Error("Expected tree to be an object, but got a string.");
  }

  /** @type {Tree} */
  const returnedTree = [];

  await Promise.all(
    Object.keys(inputTree).map(async (key) => {
      const property = await getPropertyOfPath(key);
      if (property === "node_modules") {
        returnedTree.push({
          path: key,
          property: "node_modules",
          children: [],
        });
        return;
      }
      const newProperty = property === "none" ? parentProperty : property;
      returnedTree.push({
        path: key,
        property: newProperty,
        children: await checkTree(inputTree[key], newProperty),
      });
    })
  );

  return returnedTree;
}

/**
 * @param inputTree {Tree}
 * @returns {Tree}
 */
function trimTreePaths(inputTree) {
  const cwd = process.cwd();
  const returnedTree = inputTree.map((node) => ({
    path: node.path.replace(`${cwd}/`, ""),
    property: node.property,
    children: trimTreePaths(node.children),
  }));
  return returnedTree;
}

/**
 * @param tree {Tree}
 * @param leftPad {number}
 */
function displayTree(tree, leftPad) {
  for (const node of tree) {
    if (node.property === "node_modules") continue;
    const clientIdentifier = node.property === "use client" ? "| " : "  ";
    const padding = " ".repeat(leftPad);
    console.log(`${clientIdentifier}${padding}${node.path}`);
    displayTree(node.children, leftPad + 2);
  }
}

async function main() {
  const filename = process.argv[2];
  if (!filename) {
    console.error("Please provide a filename as a command line argument.");
    process.exit(1);
  }

  const rawTree = dependencyTree({
    filename,
    directory: ".",
    tsConfig: "./tsconfig.json",
  });
  const parsedTree = await checkTree(rawTree, "none");
  const trimmedTree = trimTreePaths(parsedTree);

  displayTree(trimmedTree, 0);
}

main();
