# Python Lists

Lists are **ordered, mutable** collections — the workhorse of IOAI data prep. You will slice exam datasets, batch scores, and build pipelines without leaving Python's built-in types.

## Creating lists

Use square brackets. Lists can hold mixed types (though IOAI code usually keeps them homogeneous):

```python
scores = [88, 92, 75, 91]
names = ["Ada", "Alan", "Grace"]
empty = []
```

## Indexing & slicing

Python uses **zero-based** indexing. Negative indices count from the end — perfect for grabbing the last validation score:

```python
scores = [10, 20, 30, 40, 50]
scores[0]      # 10
scores[-1]     # 50
scores[1:4]    # [20, 30, 40]
scores[::2]    # [10, 30, 50]
```

## List comprehensions

Replace noisy `for` loops with a single expression. IOAI written rounds love compact transforms:

```python
# Square evens only
evens_sq = [x * x for x in range(20) if x % 2 == 0]
print(evens_sq[:5])  # [0, 4, 16, 36, 64]
```

## Common methods

| Method | What it does |
|--------|----------------|
| `append(x)` | Add one item to the end |
| `extend(iter)` | Add all items from another iterable |
| `sort()` | Sort in place |
| `reverse()` | Reverse in place |

## Checkpoint challenge

Create a list called **`ioai_topics`** containing the strings **"Math"**, **"Python"**, and **"DL"**.

```python
ioai_topics = ["Math", "Python", "DL"]
print(ioai_topics)
```

Click **Run Code** to execute, then **Submit & Check** to validate your answer with the auto-grader.
