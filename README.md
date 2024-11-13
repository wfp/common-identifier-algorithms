# North-West Syria - Common Identifier Algorithm

This is the algorithm repository for the USCADI hashing algorithm of the Building Blocks CommonID Tool, specifically implemented to meet the requirements of the North-West Syria region.

## Input Schema

The specific schema of input files in defined via the configuration file `[source]` section, but broadly this USCADI algorithm is expecting to receive a set of biographic fields, a set of reference fields, and a set of static assistance-related fields. Here is an example of such a schema:

- [Individual Reference] A unique value referencing this individual internally to the organisation providing assistance.
- [First Name] The first name of the individual (in Arabic).
- [Last Name] The last name of the individual (in Arabic).
- [Father First Name] The first name of the individuals father (in Arabic).
- [Mother First Name] The first name of the individuals mother (in Arabic).
- [Year of Birth] The year of birth of the individual.
- [Document Type] An optional field specifying either Local Council Card, Personal ID, or National ID.
- [Document ID] An optional field specifying a Local Council Card, Personal ID, or National ID number.
- [Organization] The BB acronym of the organisation delivering the assistance.
- [Category] The assistance category.
- [Currency] The currency of the assistance (SYP in this case).
- [Amount] The amount of intended assistance.
- [Start (yyyyMMdd)] The assistance start date.
- [End (yyyyMMdd)] The assistance end date.

The expected format of these columns in the configuration file is:

```toml
{ name = "Human Readable Name", alias = "machine_readable_alias", default = "Optional blank cell value" }
```

## Process Flow

:::mermaid
graph LR;
    A>Input Data] --> B[Clean Names];
    subgraph  
        B --> C[Transliterate to Latin];
        C --> D[Compute Phonetics Code]
        B --> E[Compute Arabic Soundex];
    end
    D --> F[Concatenate Fields]
    E --> F;
    F --> G[Hashing Algorithm]
    G --> H>Output Data]

