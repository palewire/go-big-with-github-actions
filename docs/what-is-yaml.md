# Introducing YAML

Our focus in this class will be how to configure GitHub Actions to run your code, not how to write the code itself.

So we won't be covering how to write Python or JavaScript to develop an automation.

Instead we'll focus narrowly on the tool that Actions favors for setting up tasks: the YAML programming language. To take advantage of Actions, you will need to learn how to write YAML code.

[YAML](https://en.wikipedia.org/wiki/YAML) is a data structuring system that was designed to store information in way that is easy for people to read and write. It stands for "YAML Ain't Markup Language" because it does not wrap data in tags like HTML or XML, a technique known as markup.

Programmers often choose YAML for configuration files and lightweight data storage. Here is a simple example of how it stores different types of data:

```yaml
# This is a comment

# This is a string
name: Alice

# This is an integer
age: 25

# This is a list
colors:
  - red
  - green
  - blue

# This is a nested object
address:
  street: 123 Main St.
  city: Anytown
  state: CA
  zip: 99999
```

In the case of Actions, YAML is used in the configuration files that tell the system what to do. These files are known as workflows and stored in a directory called `.github/workflows` in the root of GitHub code repositories.

GitHub offers extensive [documentation](https://docs.github.com/en/actions/writing-workflows) of how to write these files to the very particular requirements of Actions. In our next chapter, we'll start with the basics.
