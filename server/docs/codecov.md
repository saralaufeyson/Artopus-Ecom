# Codecov setup

If you want coverage uploaded to Codecov for private repositories, follow these steps:

1. Sign in to Codecov and add the repository (Codecov will request access from GitHub).
2. In your repository settings on Codecov, generate a repository upload token.
3. In GitHub, go to your repository -> Settings -> Secrets & variables -> Actions and add a new secret named `CODECOV_TOKEN` with the token value from Codecov.
4. The CI workflow already includes a step to upload coverage to Codecov if `CODECOV_TOKEN` is present.
5. Update the badge in `README.md` (replace `<OWNER>/<REPO>` with your GitHub path) to display the coverage badge.
