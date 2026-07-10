# Custom Rules for ADAPT Project

## 14. Target Application Isolation
When working in the ADAPT project, all test suite changes, selectors, mock data, and configurations must be implemented inside the ADAPT repository (`d:\adapt\projects\<project_name>`). Do not modify the actual codebase of the target system under test (whether it is `happyq` or any other target application) to satisfy, bypass, or pass E2E tests.
