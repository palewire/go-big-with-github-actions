# Introducing YAML

Our focus in this class will be how to configure GitHub Actions to run your code, not how to write the code itself.

So we won't be covering how to use Python or JavaScript or another programming language to develop the contents of an automation tailored to a specific goal. Instead we will show you broad patterns you can use automate tasks within Actions, which you can apply to any number of tasks in the programming language of your choice.

However, to work with Actions you need to know one crucial tool that may be new to you. That's the YAML programming language.

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

In the case of Actions, YAML is used in the configuration files that tell the system what to do. These files are known as workflows and stored in a directory called `.github/workflows` in the root of GitHub code repositories. They are expected to be named with the `.yml` or `.yaml` file extension.

GitHub offers extensive [documentation](https://docs.github.com/en/actions/writing-workflows) of how to write these files to fit the very particular expectations of Actions. In our next chapter, we'll start with the basics.
