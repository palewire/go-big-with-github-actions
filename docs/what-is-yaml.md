# YAML

Once you've entered the [dictionary folder](https://github.com/palewire/moneyinpolitics.wtf/tree/main/_data/dictionary), you should see a list of files. Each one contains a word's definition, along with other metadata describing it like whether it is a noun or a verb.

**PICTURE HERE**

Note that each file's name ends with `.yaml`. That tells computers that the file is expected to contain data structured in YAML format.

[YAML](https://en.wikipedia.org/wiki/YAML) is a data serialization language. It is used to represent data structures in a human-readable and easy-to-write format. YAML stands for "YAML Ain't Markup Language," because it does not wrap data in surrounding tags like HTML or XML (and because nerds like inventing [silly acronyms](https://en.wikipedia.org/wiki/Backronym).)

YAML is often used for configuration files, data storage and communication between different systems. Here is a simple example:

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

The moneyinpolitics.wtf repository has its own custom data structure expressed in YAML. You can see an example of a fully entered definition by clicking on any file in the list, such as [`contribution.yaml`](https://github.com/palewire/moneyinpolitics.wtf/blob/main/_data/dictionary/contribution.yaml)

**PICTURE HERE**

You can see that several pieces of metadata — like the `word` and the `type` — are at the top. At the bottom you can see a list of definitions, including examples of reuse, entered in the `definition_list` attribute.

When the site is published, the data stored in YAML files are rendered into [an HTML template](https://github.com/palewire/moneyinpolitics.wtf/blob/main/_layouts/word-detail.html) and served to the reader. You can find this definition at [moneyinpolitics.wtf/contribution/](https://moneyinpolitics.wtf/contribution/). Note that the slug at the end of the URL matches the name of the file.

**PICTURE HERE**

Next you will find a definition that would benefit from your contribution.