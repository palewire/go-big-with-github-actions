# Running bigger servers

GitHub Actions can do a lot, but sometimes it's simply not enough. The free service has limits on disk space, comptuing power and how long job can run.

If you need more horsepower, you can link up Actions with bigger servers hosted outside of GitHub. It's a great combination. You get the nearly limitless capacity of cloud computing without losing the convenience of GitHub Actions. Though you will have to pay for it.

We've used this technique to:

* Standardize hundreds of millions of responses to public opinion polls conducted by Reuters and Ipsos
* Refine and republish [California's gigantic database](https://github.com/palewire/django-calaccess-downloads-website) of campaign-finance filings
* Aggregates decades of climate data into global and regional averages

Amazon Web Services is a cloud-computing platform that offers file storage, servers and other forms of computing power. Its EC2 service allows you to create virtual servers that can be linked to GitHub Actions to run jobs that require more computing power than the free service can provide. This tutorial will show you how to set up EC2 instances of considerable size and link them to GitHub Actions.

The first step is to create an Amazon Web Services account, if you don't already have. Go to [aws.amazon.com](https://aws.amazon.com/) and click the button that says "Create an AWS account" in the upper right corner.

![AWS splash page](_static/aws-splash.png)

You'll provide a root email address and a name for the account. And then you'll be asked to verify your email. Then you'll enter a password, contact information and a payment method. You'll also have to verify your phone number. Once that's completed, you'll be congratulated for your wherewithal.

![AWS congrats](_static/aws-congrats.png)

Now you're ready to sign into the AWS Management Console, where you can access all of the services it offers.

![AWS console](_static/aws-console.png)

Accessing Amazon Web Services with GitHub Actions requires that you first establish an API key with permission to access the services you want to use. You can do that by clicking on the pulldown menu in the far upper right corner of the console and selecting "Security Credentials."

![Settings pulldown](_static/account-menu.png)

Then scroll down to the "Access keys" section and click the button that says "Create access key."

![Keys section](_static/keys-section.png)

Now you can create a root key pair by checking the box and clicking the button that says "Create access key."

![Keys section](_static/keys-consent.png)

The final screen will show you the key's ID and secret. I've redacted my pair in the example below.

![Keys screen](_static/redacted-keys.png)

Copy and paste them into a text file for safekeeping. You will not be able to see the secret key again. They are what Python will use to gain access to AWS from outside the console.

Outline:

- Create a AWS account
- Create API key
- Create a subnet in EC2 or security group or whatever
- Create a Personal Access Token
- Create a resuable GitHub Action like this one
- Inherit that Action in your workflow
- Run the job
