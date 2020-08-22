import { useRouter } from 'next/router'
import Link from 'next/link'
import MetaHead from 'components/MetaHead'
import ErrorPage from 'next/error'
import MainLayout from 'layouts/MainLayout'
import Sponsor from 'components/Sponsor'
import { getPostBySlug, getAllPosts } from 'lib/api'
import markdownToHtml from 'lib/markdownToHtml'
import { GetEpisode } from 'lib/podcastRss'
import { theNamedDay, stringToSlug, makeExcerpt, dayTitle, theDateString, hashtagList } from 'lib/helpers'
import { FiFacebook, FiLinkedin, FiTwitter, FiMail, FiFolder, FiMic, FiPrinter } from 'react-icons/fi'

const SocialShare = (props) => (
    <li className="mr-2">
        <a className="inline-block text-2xl md:text-xl" href={props.href} target="_blank" rel="noreferrer" title={props.title} onClick={props.onClick}>
            <span>{props.icon}</span>
            <span className="sr-only">{props.title}</span>
        </a>
    </li>
)

const AssetsLink = (props) => (
    <>
    <li className="ml-2">
        <Link href={props.link}>
            <a className="inline-block text-2xl md:text-xl" title={props.title}>
                <span>{props.icon}</span>
                <span className="sr-only">{props.title}</span>
            </a>
        </Link>
    </li>
    </>
)

export default function Post({post}) {
    const router = useRouter()

    if (!router.isFallback && !post?.slug) {
        return <ErrorPage statusCode={404} />
    }

    var url = 'https://fewdaily.com/' + post.slug

    var excerpt = post.excerpt !== undefined ? post.excerpt : makeExcerpt(post.content)

    var hashtags = hashtagList(post.tags)

    return (
        <>
            {router.isFallback ? (
                <div>Loading...</div>
            ) : (
                <MainLayout day={theNamedDay([post.slug])}>
                    <article className="max-w-4xl mx-auto">
                        <MetaHead title={dayTitle(post.slug) + ' | ' + theDateString(post.slug)} description={excerpt} day={theNamedDay([post.slug])} type="article" />
                        
                        <header>
                            <p className="mb-0 font-bold text-sm">{theDateString(post.slug)}</p>
                            <h1 className="my-0 uppercase">{dayTitle(post.slug)}</h1>
                            {post.tags !== undefined &&
                                <p>
                                    {post.tags.map((tag) => 
                                        <Link href={'/tags/' + stringToSlug(tag)} key={stringToSlug(tag)}><a className="mr-3 inline-block text-sm">{tag}</a></Link>
                                    )}
                                </p>
                            }
                        </header>

                        <Sponsor day={theNamedDay([post.slug])} />

                        <div className="mt-10 md:mt-16" dangerouslySetInnerHTML={{__html: post.renderedContent}} />

                        <GetEpisode date={post.slug}/>

                        <footer className="border-t border-solid border-gray py-4 flex justify-between print:hidden">
                            <div>
                                <p className="mb-1 text-xs">Share</p>
                                <ul className="flex flex-wrap">
                                    <SocialShare title="Facebook" icon={<FiFacebook/>} href={'https://www.facebook.com/sharer/sharer.php?u=' + url} />
                                    <SocialShare title="Twitter" icon={<FiTwitter/>} href={'https://twitter.com/intent/tweet?text=' + excerpt + '%0a'+ hashtags + '%0a&url=' + url} />
                                    <SocialShare title="LinkedIn" icon={<FiLinkedin/>} href={'https://www.linkedin.com/sharing/share-offsite?url=' + url + '&summary=' + excerpt} />
                                    <SocialShare title="Email" icon={<FiMail/>} href={'mailto:?subject=' + dayTitle(post.slug) + ' | ' + theDateString(post.slug) + '&body=' + excerpt + '%0a' + url} />
                                    <SocialShare title="Print" icon={<FiPrinter/>} onClick={() => window.print()} />
                                </ul>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-right">Assets</p>
                                <ul className="flex flex-wrap">
                                    {theNamedDay([post.slug]) !== 'tuesday' && <AssetsLink title="Social Assets" icon={<FiFolder/>} link={'/' + post.slug + '/assets'} />}
                                    <AssetsLink title="Audio Script" icon={<FiMic/>} link={'/' + post.slug + '/script'} />
                                </ul>
                            </div>
                        </footer>
                    </article>
                </MainLayout>
            )}
        </>
    )
}

export async function getStaticPaths() {
    const posts = getAllPosts(['slug'])

    return {
        paths: posts.map((post) => {
            return {
                params: {
                    slug: post.slug,
                },
            }
        }),
        fallback: false,
    }
}
  
export async function getStaticProps({ params }) {
    const post = getPostBySlug(params.slug, [
        'title',
        'slug',
        'excerpt',
        'content',
        'tags',
    ])
    const renderedContent = await markdownToHtml(post.content || '')

    return {
        props: {
            post: {
                ...post,
                renderedContent,
            },
        },
    }
}