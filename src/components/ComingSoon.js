// libs
import React from 'react';

// components
import { SocialIcons } from '../components/iconography/SocialIcons';

// styles
import '../styles/components/LandingPage.scss';
import '../styles/components/ComingSoon.scss';

export const ComingSoon = () => {

    return (
        <div id='coming-soon' className='fullscreen off-black'>
            <div id='landing-page-header'>
                <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                <div id='coming-soon-panel' className='flex-col'>
                    <div className='flex-row'><span>Additional content is coming to Soundscape soon.</span></div>
                    <div className='flex-row'><span>To stay in the loop, sign up for <span className='hot-green'>&nbsp;email updates&nbsp;</span> below.</span></div>
                    <div id="mc_embed_signup">
                        <form action="https://world.us4.list-manage.com/subscribe/post?u=4d5488d441c94ac4c98944eb9&amp;id=f3e8462184" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" novalidate>
                            <div id="mc_embed_signup_scroll">
                                <input type="email" name="EMAIL" className="email" id="mce-EMAIL" placeholder="email address" required />
                                <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true"><input type="text" name="b_4d5488d441c94ac4c98944eb9_f3e8462184" tabindex="-1" value="" /></div>
                                <div className="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button" /></div>
                            </div>
                        </form>
                    </div>
                    <span className='flex-row'>We are also seeking<span className='hot-green'>&nbsp;3D artists&nbsp;</span> to collaborate with.</span>
                    <span className='flex-row'>Please &nbsp;<a href="mailto:mark@soundscape.world">get in touch</a>&nbsp; if you have any leads!</span>
                    <SocialIcons />
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}