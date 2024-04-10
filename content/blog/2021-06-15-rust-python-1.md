---
title: Intro to Building Python Extensions in Rust
date: 2021-06-15
---

Rust is _the_ cool new systems programming language. It promises to be much safer than C/C++ while also offering a great toolchain for building
and deploying, and lots of quality-of-life features we know and love from higher-level languages.

One obvious use-case for any high-speed systems programming language is to write custom Python extensions in it. That way you get the
ease of use from Python without compromising on speed.

To make this all work, let's figure out step by step how to build a custom Python extension in Rust. I'm assuming familiarity with both these
languages; this isn't meant to be a Python or Rust tutorial.

# Simplest Case

Let's figure out how we can call a single, simple, Rust function from Python, where the Rust function doesn't have any complicated effects and just returns a simple type that's compatible with Python's types.

Goal:

```python
from rust_module import rust_function

x = 42
answer = rust_function(42)
assert answer == 55
```

```rust
fn rust_function(arg: i32) -> i32 {
  arg + 13
}
```

## Exploring PYO3

This seems to be the Rust module (crate) of choice. Or at least it is one of them. So I'll head over to their website and see what I need to do.

Here's the [guide](https://pyo3.rs/v0.13.2/) and we're interested in the section *Using Rust from Python*.

## The Cargo.toml

So, it seems we want to create a **library crate** where we tell Rust to use a particular *type* of crate to make a *shared library*. I'll try to do that via `cargo new`.

```bash
cargo new --lib rust_module
```

This creates a new directory and basic package settings file (`Cargo.toml`) that we'll have to edit. We'll add the `cdylib` library target, and add PyO3 to the dependencies:

```toml
[package]
name = "rust_module"
version = "0.1.0"
authors = ["Clemens Adolphs <clemens.adolphs@gmail.com>"]
edition = "2018"

[lib]
name = "rust_module"
crate-type = ["cdylib", "rlib"]

[dependencies.pyo3]
version = "0.13.2"
features = ["extension-module"]
```

I'm adding the `rlib` target in case I want to add tests or code that can call this library from within Rust. The `cdylib` target tells cargo to compile a dynamic library (dylib) that code from C can talk to, or other programs that know how to talk to C libraries.

## MacOS: .cargo/config

Apparently to compile our code on Mac, we also need to add an additional config file

```toml
[target.x86_64-apple-darwin]
rustflags = [
  "-C", "link-arg=-undefined",
  "-C", "link-arg=dynamic_lookup",
]

[target.aarch64-apple-darwin]
rustflags = [
  "-C", "link-arg=-undefined",
  "-C", "link-arg=dynamic_lookup",
]
```

## The lib.rs

Following along with the guide, we can now write our actual code. Let's first do it in the way the guide does, with the function returning a Python result directly.

```rust
use pyo3::prelude::*;
use pyo3::wrap_pyfunction;

#[pyfunction]
fn rust_function(arg: i32) -> PyResult<i32> {
    Ok(arg + 13)
}

#[pymodule]
fn rust_module(py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(rust_function, m)?)?;

    Ok(())
}
```

This seems quite nice and concise, actually. We grab all the stuff from the pyo3 prelude, as well as the `wrap_pyfunction` macro. The prelude gives us access to a number of commonly used definitions.

So to turn an ordinary function into a function we can call from Python, all we have to do is tag it with `#[pyfuncion]` and wrap the return type in a `PyResult`.

Then we need to add code that makes the function known to the Python module. For that, we have the `#[pymodule]` tag.

The function name tagged with `pymodule` must be exactly the name of the module.

When importing our module, python will pass in an empty module object, expecting it to be populated with our functions (and classes, presumably, if we had any). I dimly recall from my experience with C extensions for Python that this involves *a lot* of boilerplate code. Luckily, the `wrap_pyfuncion` macro takes care of all that!

## Making it all work

Now I just call `cargo build --release` to get the library compiled, and then, for simple development and testing, where I'm not worried about packaging, I can just make a symlink to the library file, renaming it in the process, and import it from python:

```rust
ln -s target/release/librust_module.dylib rust_module.so
```

And now, in the directory that has this module, I can run the following Python code successfully:

```python
from rust_module import rust_function

x = 42

answer = rust_function(x)
assert answer == 55

print(f"Success! {x} + 13 == {answer}")
```

# Next steps and closing thoughts

Well, this was as simple as it gets for an initial step. What are some things we should explore?

- Move beyond primitive types. Can we take in, and return, dictionaries?
- What about errors? If I get a Rust error somewhere, how do I turn that into a python exception?
- Python functions have both positional and keyword arguments. How do those get mapped in a Rust function call?
- Manually copying and renaming the library file works for testing, but there must be a better way. (And apparently there is, via the `maturin` crate / Rust package).
- And what about classes?
