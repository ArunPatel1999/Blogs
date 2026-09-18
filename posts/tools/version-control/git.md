# Git Commands

![Git Logo](https://git-scm.com/images/logos/downloads/Git-Logo-2Color.png)

A practical reference of Git commands covering configuration, inspecting commits, branching, stashing, tagging, rebasing, and working with remotes.

## Initial Configuration

Set up your identity and default branch name once per machine.

```bash
# Set the default branch name for new repositories
git config --global init.defaultBranch "master"

# Set your name and email (used in every commit)
git config --global user.name "Xyz"
git config --global user.email "xyz@here.com"

# View the full configuration
git config --list
```

## Inspecting History

```bash
# Compact one-line-per-commit view of the history
git log --oneline
```

> Tip: A `.gitkeep` file is a convention used to track an otherwise empty folder,
> since Git does not track empty directories on its own.

## Tracking a File Through a Commit

Git stores data as objects: a commit points to a tree, a tree points to blobs (files) and other trees (folders).

```bash
# Get the tree ID for a given commit hash
git show -s --pretty=raw $GIT_HASH

# List the contents of a tree (a "tree" is a folder, a "blob" is a file)
git ls-tree $TREE_ID

# Show the contents stored in a blob
git show $BLOB_ID
```

## Branching

```bash
# Show the current branch name
git branch --show-current

# Rename a branch
git branch -m old_name new_name

# Delete a branch
git branch -d branch_name

# Abort an in-progress merge
git merge --abort
```

## Comparing Changes (diff)

```bash
# Show staged changes that are not yet committed
git diff --staged

# Compare two branches or two commits
git diff branch_name/commit_hash branch_name/commit_hash
```

## Stashing

Temporarily shelve changes so you can work on something else, then restore them later.

```bash
# Stash current changes
git stash

# Stash with a descriptive message
git stash save "message"

# List all stashes
git stash list

# Apply the most recent stash (keeps it in the stash list)
git stash apply

# Apply the most recent stash and remove it from the list
git stash pop

# Drop the most recent stash
git stash drop

# Apply a specific stash to the current branch
git stash apply stash@{index}

# Apply a specific stash to a specific branch
git stash apply stash@{index} branch-name

# Remove all stashes
git stash clear
```

## Tagging

```bash
# List all tags
git tag

# Create a lightweight tag
git tag tag_name

# Create an annotated tag with a message
git tag -a tag_name -m message

# Tag a specific commit
git tag tag_name commit_id

# Push a tag to the remote
git push origin tag_name

# Delete a tag
git tag -d tag_name
```

## Rebasing

```bash
# Rebase the current branch onto master
# (replays your commits on top of master's history)
git rebase master
```

## Recovering with reflog and reset

```bash
# Show the history of actions (checkouts, commits, resets, etc.)
git reflog

# Reset to a specific commit, discarding working changes
git reset --hard commit_hash

# Reset to a reflog entry
git reset --hard HEAD@{index}
```

## Working with Remotes

```bash
# Show the configured remote URLs
git remote -v

# Push and set upstream tracking for the branch
git push -u origin master
```
