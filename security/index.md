# Security and Data Governance

Building with AI does not require handing your records to a third party. This is how we protect sensitive information during design and in everything we build.

## The approach

- **Built with test data.** AI writes and tests the code with synthetic or redacted data. Your records are never sent to an AI model during the build.
- **The code does the work.** Our deliverables read, sort and draft the same way every time, inside your systems.
- **AI in live systems.** Where a running system uses AI, it goes through Anthropic's business API, under terms that do not use the data to train AI models. Consumer chat applications are never used.
- **Sensitive fields excluded.** Details such as Social Security numbers and bank accounts are masked or excluded from what the AI sees.
- **Human approval.** A person approves anything that moves money, changes a record or commits you to a customer.
- **A complete activity record.** Every action the system prepares is logged with who approved it and when.

## Access and storage

- **Your systems, your data.** Wherever possible we build inside your own environment, such as Microsoft Azure, and keep no copies.
- **Least-privilege access.** Separate accounts with only the access the work requires, removed when the engagement ends.
- **Read-only during design.** Nothing changes in your systems during Solution Design.
- **Secrets in a vault.** API keys and passwords stay server-side, for example in Azure Key Vault, never in code.

## Agreements and engagement close

- **NDA on request.** We sign a non-disclosure agreement or a data processing agreement on request.
- **Returned or deleted.** At the end of an engagement, your data is returned or deleted.

## Questions from your IT or security team

Please send them to [alexp@khipuai.co](mailto:alexp@khipuai.co) or raise them on a free discovery call. Please do not send passwords or client records by email; we will first agree on a secure way to share them.

We are documenting these practices as formal policies and procedures for your IT team to review; each will be listed here once complete. How this website handles your information is described in the [privacy policy](https://khipuai.co/privacy/).
