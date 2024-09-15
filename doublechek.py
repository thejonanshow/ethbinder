import requests

OWNER = "thejonanshow"
REPO = "ethbinder"
API_URL = f"https://api.github.com/repos/{OWNER}/{REPO}/issues"
HEADERS = {"Accept": "application/vnd.github.v3+json"}

def fetch_issues():
    page = 1
    all_issues = []

    while True:
        print(f"Fetching page {page}...")
        response = requests.get(API_URL, headers=HEADERS, params={"page": page, "per_page": 100, "state": "all"})

        if response.status_code != 200:
            print(f"Failed to fetch issues: {response.status_code}, {response.text}")
            break

        issues = response.json()

        if not issues:
            break  # No more issues

        non_dependabot_issues = [
            issue for issue in issues if issue["user"]["login"] != "dependabot[bot]"
        ]
        all_issues.extend(non_dependabot_issues)
        page += 1

    return all_issues

def main():
    issues = fetch_issues()
    print(f"Fetched {len(issues)} issues (excluding dependabot)")

    for issue in issues:
        print(f"Title: {issue['title']}")
        print(f"Author: {issue['user']['login']}")
        print(f"Body: {issue.get('body', 'No body')}")
        print("-" * 80)

if __name__ == "__main__":
    main()

