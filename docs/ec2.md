# Running bigger servers

GitHub Actions can do a lot, but sometimes it's simply not enough. The free service has limits on disk space, comptuing power and how long job can run.

If you need more horsepower, you can link up Actions with bigger servers hosted outside of GitHub. It's a great combination. You get the nearly limitless capacity of cloud computing without losing the convenience of GitHub Actions. Though you will have to pay for it.

We've used this technique to:

* Standardize hundreds of millions of responses to public opinion polls conducted by Reuters and Ipsos
* Refine and republish [California's gigantic database](https://github.com/palewire/django-calaccess-downloads-website) of campaign-finance filings
* Aggregates decades of climate data into global and regional averages

Outline:

- Create a AWS account
- Create API key
- Create a subnet in EC2 or security group or whatever
- Create a Personal Access Token
- Create a resuable GitHub Action like this one
- Inherit that Action in your workflow
- Run the job
