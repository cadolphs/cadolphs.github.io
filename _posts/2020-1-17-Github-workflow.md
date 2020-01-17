---
layout: post
title: Some common issues in feature-branch Github workflow
---

This article is a quick overview of the github workflow I currently use with my team. It is mostly for a quick reference to team members about what to do in some of the rarer situations.

# Basic setup
- Development happens in feature branches that are then squash-merged into a branch `develop` after a pull request.
- Before sending a PR, a feature-branch should be **rebased** onto `develop`
- It is encouraged that PRs are small but complete.
# The simplest case

Let’s consider a branch `feature1` with a bunch of commits to be merged into `develop`. The easiest case has that branch live in isolation: no other branches branch off of `feature1`.
In this case, all that needs to happen is:

    git checkout feature1
    git rebase -i origin/develop   ## use this step to clean up commit history a bit
    git push -f

And then we create the pull request on github. If everybody is happy, it will be squashed and merged. The branch `feature1` can now safely be deleted.

## What squash-and-merge does

This takes all the commits from the feature branch, creates a new commit that contains all their collective changes, and applies that commit to the develop branch. That way, develop has one commit per pull request.
This also means that the two branches now diverge: `feature1` has a bunch of commits, whereas `develop` only has one commit. Git doesn’t know that these are essentially the same changes. In the simple case, this doesn’t matter, because we’re deleting `feature1` anyway!


# Hard case 1: Extra development after rebase

Consider this scenario: Branch `feature1` has been rebased onto `develop` and sent off for a pull request. After this step, a new branch `feature2` was created off of `feature1` to continue some development that relied on the new feature introduced in `feature1`

![](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579294479316_image.png)

## Case 1: PR gets accepted without changes

Awesome work, no changes. So let’s do the squash-merge. Remember, this creates a new commit:

![](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579294835786_image.png)


So far so good. Now let’s say we’re done with our work on `feature2` and want to rebase onto `develop` prior to sending a pull request. If we do this naively, this is what happens:

![](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579294937380_image.png)


**YIKES.** Remember that, due to the squash-merge, commit C5 contains the work that was done in commits C2 and C3. But git doesn’t keep track of that. So if we tell it to rebase `feature2` onto `develop`, it will grab *all* commits from `feature2` that weren’t part of develop. This means C2, C3, and C4. Then it creates new commits that apply those same changes onto `develop`.
**The correct way:**
In our case, we really only want the commit C4 to be taken from `feature2` and applied to `develop`. The way to achieve this is the `--onto` option of `git rebase`. Here is what we should have done:


    git checkout feature2
    git rebase --onto develop feature1
    git push -f

What is this? It tells git to:

- Take those commits from `feature2` that are ahead of `feature1`. In this case, C4.
- Apply those commits as new commits to `develop` instead of `feature1`.
- Make `feature2` point to the latest of those new commits.
![](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579295868424_image.png)


(The git playground doesn’t support these sophisticated commands, so instead of saying C4’ it says C6).
Now C6 contains the changes of C4, but applied to develop.

## Case 2: Extra changes to feature1
![](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579295694877_image.png)


Here our PR in `feature1` got accepted with some revisions. C6 now contains the work of C2, C3, and C5. On the other hand, `feature2` has diverged from `feature1`.
There’s two ways to deal with this. Let’s do the one that’s easier conceptually: If `C4` was coming *after* C5, we could use the solution of the previous chapter. So let’s make it so:

    git checkout feature2
    git rebase feature1
    git rebase --onto develop feature1
    git push -f

The first two lines give

![](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579296061588_image.png)


which is the same as in the previous chapter, so the rebase-onto works.

But if we think about it for a bit, we could have skipped that intermediate step and just used the `rebase` `--``onto` from the start: Our first rebase grabs C4 and makes a new commit that makes it apply to `feature1`. The next rebase grabs C4’ and makes that apply to `develop`. So why not just grab C4 and apply that directly to develop? So then the faster version is

    git checkout feature2
    git rebase --onto develop feature1
    git push -f
# Hard case 2: Multiple people on branch

There are several pitfalls with this, but they can all be avoided with proper care. Let’s take a look:

## Beware the rebase

Rebasing a branch changes the commits in its history. That’s why, after a rebase, you have to push with the `-f` (force!) option. It also means that, once it’s been pushed, anybody who was also working on that branch now has a local version that’s in conflict with the remote version.
**Important:** Before doing a rebase on a branch with multiple collaborators, let everybody know! Make sure everybody’s local changes are integrated (see below) and all local branches are up to date with the origin. Then do the rebase and force-push. After that, everybody else needs to run

    git checkout branch_that_was_rebased
    git fetch --all
    git reset --hard origin/branch_that_was_rebased

This makes your local version of the branch the same as the remote version that was just forcefully pushed

## Don’t create a bajillion merge commits

Let’s say you and your buddy are working on the same branch (but on different files). You are constantly committing, pushing, and pulling. Now each time there were “simultaneous” commits and you do a git push / pull, you’ll create extra merge commits:

![Real work was done in C2 and C3, whereas C4 is just a merge commit](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579297102356_image.png)


The reason is this: You can’t push your local branch to origin unless it’s a “fast forward”, i.e., there’s no changes in the origin that you don’t have locally. One way to get those remote changes is `git pull`. This is nothing other than a `git merge` of the remote commits into your local branch, so unless it’s again a simple fast-forward, it’ll create an extra merge commit. A productive coding session can create quite a few of those, and they’ll needlessly clutter up the commit history.

Ideally, we want merge commits to have “real” meaning, as in “this new feature was developed in this branch and upon completion merged into our development branch”. It shouldn’t reflect minute details of who worked on what file in the run-up to it.

**The solution:** Use `git pull` `--``rebase` instead. This tells `git` to take the remote changes and replay your local changes on top of them:

![Before the git pull --rebase](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579297414683_image.png)
![After the git pull --rebase](https://paper-attachments.dropbox.com/s_FE834B07340B42F115869E47B3A6D36A022DFDF5AFB60F065BB8B3DFF3BFD3B8_1579297500275_image.png)


Since we’re rebasing, there won’t be a separate merge commit, and now we can use `git push` without problem, since it’ll be a simple fast-forward.
**Note:** In the previous section I talked about the pitfalls of a rebase when multiple people were using a branch. This does **not** apply to `git pull` `--``rebase`. It is completely safe to use, because it only affects exactly those commits that are currently on your machine and not on remote.

