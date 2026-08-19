import LangRedirect from './components/LangRedirect';
import componentResolver from './utils/component-resolver';
import {getPageBySlug} from "@/app/[lang]/utils/get-page-by-slug";


export default async function RootRoute({params}: { params: { lang: string } }) {
    const page = await getPageBySlug('home', params.lang)
    if (!page?.data) return null
    if (page.data.length == 0 && params.lang !== 'en') return <LangRedirect />
    if (page.data.length === 0) return null
    const contentSections = page.data[0].attributes.contentSections
    return contentSections.map((section: any, index: number) =>
        componentResolver(section, index)
    )
}
