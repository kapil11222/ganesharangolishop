<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Festival storefront styling is scoped to the shared shop layout and campaign-owned CSS tokens; this keeps seller tools unaffected and restores the normal shop when the campaign expires.
- Pasted welcome HTML stays in a script-disabled sandbox; built-in campaign styling provides the full-shop experience independently of custom welcome markup.
