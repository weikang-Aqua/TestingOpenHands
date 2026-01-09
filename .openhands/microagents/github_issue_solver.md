---
name: github_issue_solver
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers: []
---

# GitHub Issue Solver and Pull Request Creator

This microagent helps solve GitHub issues and create pull requests for the repository.

## Purpose

Automate the process of:
1. Analyzing GitHub issues
2. Implementing solutions
3. Creating pull requests with appropriate descriptions

## Workflow

### Step 1: Understand the Issue
- Read the GitHub issue carefully
- Identify the problem or feature request
- Understand acceptance criteria if provided
- Check for any related issues or discussions

### Step 2: Analyze the Codebase
- Explore the repository structure
- Identify relevant files that need modification
- Understand existing code patterns and conventions
- Check for existing tests related to the area of change

### Step 3: Implement the Solution
- Create a new branch with a descriptive name (e.g., `fix/issue-123-description` or `feature/issue-123-description`)
- Make minimal, focused changes to address the issue
- Follow existing code style and conventions
- Add or update tests as needed
- Ensure all existing tests pass

### Step 4: Create Pull Request
- Commit changes with clear, descriptive commit messages
- Push the branch to the remote repository
- Create a pull request with:
  - A clear title referencing the issue (e.g., "Fix #123: Description of the fix")
  - A detailed description explaining:
    - What changes were made
    - Why these changes were necessary
    - How to test the changes
  - Link to the related issue using GitHub keywords (Fixes #123, Closes #123, etc.)

## Best Practices

- Keep pull requests focused on a single issue
- Write clear commit messages
- Include tests for new functionality
- Update documentation if needed
- Request reviews from appropriate team members
- Respond to review feedback promptly

## Error Handling

- If the issue is unclear, ask for clarification before implementing
- If multiple approaches are possible, document the chosen approach and reasoning
- If tests fail, investigate and fix before creating the PR
- If there are merge conflicts, resolve them carefully

## Limitations

- This microagent requires access to the GitHub repository
- Authentication must be properly configured
- Complex issues may require human review and guidance
