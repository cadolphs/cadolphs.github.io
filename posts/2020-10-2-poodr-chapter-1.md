---
title: Practical Object Oriented Design - Book Notes - Chapter 1
date: 2020-10-02
---

This is the first post in what I hope to be a series of posts, discussing my experience and thoughts with reading the excellent book, ["Practical Object Oriented Design"](https://www.poodr.com/), by Sandi Metz. This is mostly so I can internalize the great lessons from the book, and the best way to do that is to try and explain those lessons to others.

The book itself uses Ruby as the programming language of choice to explore the principles of good object oriented design. My own examples will be from Python as that is what I am using at work.

Let us now dive right into the first chapter.

# What is Object Oriented Design all About?
Old-school programming languages like FORTRAN and C are _procedural_ languages. The programs are a set of step-by-step instructions, and these instructions operate on data.

In object-oriented programming languages, you instead view the world as being made up of objects that interact with each other by _sending messages_. In technical terms, your objects are described by classes, and sending a message means calling a class's method.

When attempting object-oriented design (OOD), you need to shift your perspective away from procedures and modules towards these objects and messages. Merely taking procedural code and slapping classes around the functions does _not_ make it object oriented.

# What is Design Good for Anyway?
Here is an uplifting quote from the book's first chapter:

> The programming techniques that make code a joy to write overlap with those that most efficiently produce software. 

So what makes code a joy to write? Code that is clear and logical and easy to work with. In particular, code that is easy to _change_. A big point of the book, especially given it's subtitle "An Agile Primer", is that it is guaranteed that your program will have to change. Maybe requirements weren't clear at the start. Maybe the program was a success and now enthusiastic clients are asking for additional features. Whatever the reason, you will need to change your code.

And if your program is anything but short-lived, the time spent _modifying_ the program is far greater than the time spent on the initial writing.

So then design is about solving the problem of writing code that is easy to change. It's not about dazzling your coworkers with intricate patterns or architectures.

## Why Change is Hard
The book goes on to explain _why_ change is hard and can introduce problems when the code is not designed well:

Looking at your object-oriented program, you have a bunch of objects that send each other a bunch of messages to produce the desired behaviour. For that to work, your objects need to know certain things about each other: Who to send what message to and in what format?

While this knowledge is necessary to get any work done, it also creates _dependencies_. It is these dependencies that stand in the way of change: If class A depends on class B being "just so", then a change to class B forces a change in class A. Before you know it, these forced changes have rippled through the entire program. 

Good object-oriented design is all about _managing_ these dependencies. We can never completely get rid of them, but by making careful choices about the design we can limit them to the absolute minimum.

## A Practical Definition of Design
I remember back in university, a fellow Physics student ask me (because I also took Comp Sci classes) what classes were actually for, since he was convinced you could achieve any conceivable bit of functionality just as well without them. I did not have a good reply back then because, _technically_ he was right. Classes are not so much about providing functionality as they are about organizing that functionality.

Sandi Metz has a very simple, practical definition of design:

> Every application is a collection of code; the code’s arrangement is the design.

As an example of bad design, I remember my first days of learning Visual Basic 6 in high school. You had a nice drag and drop editor for user interfaces, and the control elements like clickable buttons had event-based methods like `on_click()` that the runtime environment would call for you when you actually clicked the button. 

These event methods were where I put _all_ the application code and business logic of my programs. In terms of functionality, my programs did exactly what I wanted them to do. But when I wanted to change the user interface, I also had to carefully rearrange where the internal workings of the program took place. Truly hard work, and an example of code that's maybe not arranged in the best possible way.

This example demonstrates that code has two potentially conflicting demands: Obviously, it must solve the problem that it's meant to solve. But it must _also_ be written in such a way that it can easily incorporate future changes.

Here it is important to make a distinction: Anticipating _change_ is not the same as anticipating _one particular future change_ and then pre-emptively accounting for that anticipated change. We cannot see the future and we cannot guess what additional features or requirements we will face. That is not what design is about. Instead, it is about leaving the code "room to breathe" so that _whatever_ change actually arrives in the future can be easily incorporated.

# The Tools of Design
Next, the author talks about two tools in the kit of a software engineer: Design Principles and Design Patterns. Let's take a look.

## Design Principles
While design involves judgement calls, tradeoffs, and some subjective assessments, there are certain guiding principles that have emerged and become evident over the years. There is academic evidence that following these principles makes your code better (i.e., easier to change). In the course of the boook, the author will touch on many of them and go in-depth. The most famous principles are:

* SOLID: Single Responsibility, Open-Closed, Liskov-Substitution, Interface Segregation and Dependency Inversion (or Injection)
* DRY (Don't Repeat Yourself)
* Law of Demeter (LoD)

I won't expand on them here. Stay tuned for more on them, though.

## Design Patterns
Some problems in object-oriented design come up time and again, and so the "Gang of Four" (Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides) wrote a book called "Design Patterns" where they present "simple and elegant solutions to specific problems in object-oriented software design". They have names like Singleton, Factory, Command, Adapter, Decorator, Strategy etc and are a great tool in every programmers toolbox.

**Beware** though: Many novice programmers, myself included, get overzealous when they first learn about patterns. In an attempt to appear sophisticated, they then try and cram patterns into every bit of code no matter how misplaced the pattern actually is. Use the right tool for the job!

# The Act of Design
Now the author explains how and when to design, and first explains how design can fail. For that, there's basically two failure modes at the extremes: Too little design, or too much design.

With too little design, your application quickly devolves into spaghetti code. There's a good chance that every programmer is familiar with this problem, because every programmer started out as a novice who didn't know the least bit about design.

On the other hand, there's too much design. That's the aforementioned pattern zealot, or someone who wraps every little bit of code in ten layers of abstraction and indirection. 

There's another failure mode: Separating the act of design from the act of programming. Sometimes derisively referred to as "Big Up-Front Design" (BUFD), the problem with it is that it severes the all-important feedback loop between programming and designing. Ideally, your design will evolve incrementally:

- A small program is easy to write and easy to design well
- If you have a program that is designed well, it will be easy to change
- Adding a _small_ change to a well-designed program allows you to arrive at a well-designed slightly bigger program

It follows that small, incremental steps are the ticket to arrive at a well-designed big program.

In this agile sense, design is simply about maintaining your ability to easily incorporate the changes of the next iteration. It is vastly different from the BFUD where you try, in advance, to specify exactly where everything will go.

# Judging Design
Next up, the author discusses _metrics_ for design, such as class cohesion. There are tools that analyze your code and give you a score on certain metrics, but there's no clear-cut correlation between scores and code quality. You can have high scores and bad design, because you're only looking at proxy measures.

The _true_ measure of a good design would be something like "cost per feature over the time interval that matters". But this is incredibly hard to measure. 

What's this time interval thing? Well, when writing any feature, you are dealing with the trade-off of design and cost. Spending more time on making the design good costs time now, and delays the feature, but it reaps benefits further down the line in making other features cheaper to implement. There is an intricate balance: As the author points out, the advantage of having a feature done _right now_ might outweigh the costs associated with fixing a rushed design. It is also a matter of skill: If you are a skilled software engineer, the extra time taken to get the design right will be small, and thus your design efforts will reach a net positive effect rather early. If, on the other hand, you are a novice, you might spend a lot of time on a design that won't even be that good, and thus the effort might actually never pay off.

# Summary
- Design is about arranging code such that it can efficiently accommodate change
- Code that is easy to change is a joy to work with
- Principles and patterns are tools, but how to apply them is an art, or a craft
- Avoid under- and overdesigning by understanding the theory of design and learning how to translate that into practice

Next up, we will be looking at the first principle: The Single Responsibility Principle.
