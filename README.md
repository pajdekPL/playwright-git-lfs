# Using Git LFS for Playwright Visual Test Screenshots

While working on various projects, I struggled to find a good solution for managing golden screenshots in Playwright - so I decided to share my approach, hoping it helps others facing the same challenge! All examples and source code are available here: https://github.com/pajdekPL/playwright-git-lfs. I assume you are familiar with Playwright and Git.

This guide explains how to set up and use Git Large File Storage (LFS) to efficiently manage golden/baseline screenshots in your Playwright visual testing workflow. Additionally, it provides a Docker-based solution for generating consistent golden screenshots across different platforms, ensuring reliable visual testing in CI environments. 

## Why Git LFS for Visual Testing?

When performing visual testing with Playwright, you need to store baseline (golden) screenshots to compare against during test runs. These image files can quickly increase your repository size. Git LFS helps by:

1. Storing large files outside of regular Git
2. Replacing image files with lightweight pointers in your Git repository
3. Improving repository clone and pull times
4. Making it more efficient to work with binary files

### Benefits of Version-Controlled Screenshots

Keeping screenshots in your repository (via Git LFS) provides several key advantages:

1. **Team Collaboration**: Team members can review and approve visual changes through standard Git workflows
2. **Change History**: Track the evolution of your UI over time with full history of visual changes
3. **Code Review Integration**: Review visual changes alongside code changes in pull requests
4. **Accountability**: Know who made specific visual changes and when they were made
5. **Rollback Capability**: Easily revert to previous versions of screenshots if needed
6. **CI/CD Integration**: Automated visual testing in CI/CD pipelines with consistent baselines

## Setup Instructions

### 1. Install Git LFS

```bash
# macOS (using Homebrew)
brew install git-lfs

# Initialize Git LFS
git lfs install
```

For other platforms, refer to the official Git LFS documentation: https://git-lfs.com

### 2. Configure Git LFS for Screenshots

Create a `.gitattributes` file in your repository root and specify which files should be tracked by Git LFS:

```plaintext
# Track all PNG files in the tests directory
tests/**/*.png filter=lfs diff=lfs merge=lfs -text
```

### 3. Set up Playwright Visual Testing

In your Playwright configuration (`playwright.config.ts`), configure the screenshots directory:

```typescript
export default defineConfig({
  testDir: './tests',
  snapshotDir: "./screenshots",

// rest of your Playwright config
});
```

## Usage

### Creating Baseline Screenshots

1. Write your visual test:
```typescript
import { test, expect } from '@playwright/test';

test('homepage visual test', async ({ page }) => {
  await page.goto('https://your-website.com');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

2. Generate baseline screenshots:
```bash
npx playwright test --update-snapshots
```

3. Track new screenshots with Git LFS

Once Git LFS is set up, you can use Git as you normally would - just use regular `git add`, `git commit`, and `git push` commands. Git LFS works seamlessly in the background, automatically handling the screenshot files based on your `.gitattributes` configuration.

```bash
git add tests/screenshots
git commit -m "Add baseline screenshots"
git push
```

### Running Visual Tests

Regular test runs will compare against the baseline images:

```bash
npx playwright test
```

## Building and Running PW in Docker - golden screenshots generation

Most CI environments run on Linux machines, so it's important to maintain Linux-specific screenshots for consistent visual testing. If you're developing on macOS, you'll need to generate the Linux screenshots using Docker:

Use to start the Docker container:

```bash
docker run --rm \
  --network host \
  --ipc=host \
  -v "$(pwd)":/work/ \
  -w /work/ \
  -it mcr.microsoft.com/playwright:v1.49.0-noble \
  /bin/bash -c "npm install && bash"
```
Or use the provided script that will automatically detect Playwright version and build the correct Docker image:

```bash
chmod +x run-pw-docker.sh

./run-pw-docker.sh
```

Now you should be in docker, you can for example generate golden screenshots that are used for CI execution:

```bash
npx playwright test --grep "YOUR TEST" --update-snapshots
```

The script uses `jq` to parse Playwright version from npm list, if you don't have it, you can install it using `brew install jq`.

These Linux-generated screenshots will ensure consistency with your CI environment, preventing false positives in visual regression tests that might occur due to platform-specific rendering differences. If you don't have Docker installed the free alterantive for MAC is Colima: https://colima.dev/. You can install it using:

```bash
- `brew install colima `
- `brew install docker`
- `colima start`
```

### Screenshot Management Strategy

We use a specific naming convention and Git configuration to manage screenshots effectively:

1. Only Linux-generated screenshots are stored in the repository (used for CI):
   ```plaintext
   # .gitignore
   *.png
   !*-linux.png
   ```
   This configuration:
   - Ignores all PNG files by default
   - Explicitly tracks only screenshots with `-linux.png` suffix
   - Ensures consistent visual testing in CI environment`

This approach:
- Reduces repository size by storing only essential screenshots
- Ensures consistent visual testing in CI pipeline
- Prevents conflicts from different OS-specific renderings


## Best Practices

1. **Organize Screenshots**: Keep a clear directory structure for screenshots, e.g., by feature or component.
2. **Meaningful Names**: Use descriptive names for screenshot files that indicate what they represent.
3. **Tagging**: Use tags to labeling visual tests, such as `@visual-regression` or `@visual-test`.
4. **Review Changes**: Always review screenshot changes before committing them.
5. **CI Setup**: Ensure your CI environment has Git LFS installed and configured.

## Common Issues and Solutions

### Large Repository Size
- Regularly clean up unused screenshots
- Consider using `.gitattributes` to track only specific directories

### Team Collaboration
- Ensure all team members have Git LFS installed locally
- Team members must run `git lfs pull` after cloning or pulling changes to download the actual screenshot files
- Without Git LFS installed, team members will only see pointer files instead of actual screenshots

### CI/CD Integration
- Install Git LFS in your CI environment:
```yaml
- name: Install Git LFS
  run: |
    git lfs install
    git lfs pull
```

### Git Hooks Integration
- When using Husky with Git LFS, be aware that they use different Git hooks structures
- Husky may need additional configuration to work alongside Git LFS hooks
- You might need to manually add Git LFS hooks to your Husky configuration:
```json
{
  "hooks": {
    "pre-push": "git lfs push --all origin && your-other-hooks",
    "post-checkout": "git lfs checkout",
    "post-merge": "git lfs checkout"
  }
}
```

## Conclusion

Using Git LFS for Playwright visual test screenshots provides an efficient way to manage your test assets while keeping your repository performant. It allows team members to easily share and update baseline images while maintaining good version control practices. Please also consider using Docker for consistenc.
